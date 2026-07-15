import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get feedbacks for a project
router.get('/project/:projectId', authenticateToken, async (req: any, res: any) => {
  const { projectId } = req.params;
  try {
    const feedbacks = await db.feedbacks.find({ projectId });
    return res.json({ feedbacks });
  } catch (err: any) {
    console.error('Error fetching feedbacks:', err);
    return res.status(500).json({ error: 'Server error while fetching feedbacks' });
  }
});

// Create feedback (with coordinates for contextual overlay)
router.post('/', authenticateToken, async (req: any, res: any) => {
  const { projectId, text, x, y, screenshotUrl, taskId } = req.body;
  const { email, id: userId, role } = req.user;

  if (!projectId || !text) {
    return res.status(400).json({ error: 'Project ID and feedback message are required' });
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

    const newFeedback = await db.feedbacks.create({
      projectId,
      text,
      reporterEmail: email,
      x: x !== undefined ? Number(x) : undefined,
      y: y !== undefined ? Number(y) : undefined,
      screenshotUrl: screenshotUrl || '',
      taskId: taskId || undefined,
      resolved: false
    });

    // Create system notification for developer
    const developer = await db.users.findById(project.developerId);
    if (developer && role === 'client') {
      await db.notifications.create({
        userId: developer._id || developer.id,
        projectId,
        text: `New contextual feedback from client ${email}: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`
      });
    }

    return res.status(201).json({ feedback: newFeedback });
  } catch (err: any) {
    console.error('Error creating feedback:', err);
    return res.status(500).json({ error: 'Server error while creating feedback' });
  }
});

// Resolve feedback
router.patch('/:id', authenticateToken, async (req: any, res: any) => {
  const { id } = req.params;
  const { resolved } = req.body;
  const { id: userId, email, role } = req.user;

  try {
    const feedback = await db.feedbacks.findById(id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const project = await db.projects.findById(feedback.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isDeveloper = role === 'developer' && project.developerId === userId;
    const isClient = role === 'client' && project.clients.includes(email.toLowerCase());
    if (!isDeveloper && !isClient) {
      return res.status(403).json({ error: 'Unauthorized to modify feedback status' });
    }

    const updatedFeedback = await db.feedbacks.findByIdAndUpdate(id, { resolved: !!resolved });

    // Notify client if developer resolved their feedback
    if (resolved && role === 'developer') {
      const client = await db.users.findOne({ email: feedback.reporterEmail.toLowerCase() });
      if (client) {
        await db.notifications.create({
          userId: client._id || client.id,
          projectId: project._id || project.id,
          text: `Your feedback on "${project.name}" has been marked as resolved by the developer.`
        });
      }
    }

    return res.json({ feedback: updatedFeedback });
  } catch (err: any) {
    console.error('Error updating feedback:', err);
    return res.status(500).json({ error: 'Server error while updating feedback' });
  }
});

// Delete feedback
router.delete('/:id', authenticateToken, async (req: any, res: any) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  try {
    const feedback = await db.feedbacks.findById(id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const project = await db.projects.findById(feedback.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (role !== 'developer' || project.developerId !== userId) {
      return res.status(403).json({ error: 'Only developers can delete feedback points' });
    }

    await db.feedbacks.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Feedback removed successfully' });
  } catch (err: any) {
    console.error('Error deleting feedback:', err);
    return res.status(500).json({ error: 'Server error while deleting feedback' });
  }
});

export default router;
