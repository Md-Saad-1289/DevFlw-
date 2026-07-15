import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get workspace messages
router.get('/project/:projectId', authenticateToken, async (req: any, res: any) => {
  const { projectId } = req.params;
  try {
    const messages = await db.messages.find({ projectId });
    return res.json({ messages });
  } catch (err: any) {
    console.error('Error fetching messages:', err);
    return res.status(500).json({ error: 'Server error while fetching messages' });
  }
});

// Post a message
router.post('/', authenticateToken, async (req: any, res: any) => {
  const { projectId, text } = req.body;
  const { id: userId, name, email, role } = req.user;

  if (!projectId || !text) {
    return res.status(400).json({ error: 'Project ID and message text are required' });
  }

  try {
    const project = await db.projects.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isDeveloper = role === 'developer' && project.developerId === userId;
    const isClient = role === 'client' && project.clients.includes(email.toLowerCase());
    if (!isDeveloper && !isClient) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newMessage = await db.messages.create({
      projectId,
      senderId: userId,
      senderName: name,
      senderEmail: email,
      senderRole: role,
      text
    });

    // Notify other workspace users of the new chat message
    const alertUsers = role === 'developer'
      ? await db.users.find({ email: { $in: project.clients } })
      : [await db.users.findById(project.developerId)];

    for (const u of alertUsers) {
      if (u && (u._id || u.id) !== userId) {
        await db.notifications.create({
          userId: u._id || u.id,
          projectId,
          text: `New chat message from ${name}: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`
        });
      }
    }

    return res.status(201).json({ message: newMessage });
  } catch (err: any) {
    console.error('Error sending message:', err);
    return res.status(500).json({ error: 'Server error while sending message' });
  }
});

export default router;
