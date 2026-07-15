import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get tasks for a project
router.get('/project/:projectId', authenticateToken, async (req: any, res: any) => {
  const { projectId } = req.params;
  try {
    const tasks = await db.tasks.find({ projectId });
    return res.json({ tasks });
  } catch (err: any) {
    console.error('Error fetching tasks:', err);
    return res.status(500).json({ error: 'Server error while fetching tasks' });
  }
});

// Create task
router.post('/', authenticateToken, async (req: any, res: any) => {
  const { projectId, title, description, status, priority, assignedTo, dueDate } = req.body;
  const { id: userId, email, role } = req.user;

  if (!projectId || !title) {
    return res.status(400).json({ error: 'Project ID and task title are required' });
  }

  try {
    const project = await db.projects.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify membership
    const isDeveloper = role === 'developer' && project.developerId === userId;
    const isClient = role === 'client' && project.clients.includes(email.toLowerCase());
    if (!isDeveloper && !isClient) {
      return res.status(403).json({ error: 'Unauthorized to add tasks' });
    }

    const newTask = await db.tasks.create({
      projectId,
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo: assignedTo || '',
      dueDate: dueDate || ''
    });

    // Notify other users
    const alertUsers = role === 'developer' 
      ? await db.users.find({ email: { $in: project.clients } })
      : [await db.users.findById(project.developerId)];

    for (const u of alertUsers) {
      if (u) {
        await db.notifications.create({
          userId: u._id || u.id,
          projectId,
          text: `New task added by ${req.user.name}: "${title}"`
        });
      }
    }

    return res.status(201).json({ task: newTask });
  } catch (err: any) {
    console.error('Error creating task:', err);
    return res.status(500).json({ error: 'Server error while creating task' });
  }
});

// Update task status, priority, or details
router.patch('/:id', authenticateToken, async (req: any, res: any) => {
  const { id } = req.params;
  const { title, description, status, priority, assignedTo, dueDate } = req.body;
  const { id: userId, email, role } = req.user;

  try {
    const task = await db.tasks.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const project = await db.projects.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Associated project not found' });
    }

    // Verify membership
    const isDeveloper = role === 'developer' && project.developerId === userId;
    const isClient = role === 'client' && project.clients.includes(email.toLowerCase());
    if (!isDeveloper && !isClient) {
      return res.status(403).json({ error: 'Unauthorized to modify task' });
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (dueDate !== undefined) updates.dueDate = dueDate;

    const updatedTask = await db.tasks.findByIdAndUpdate(id, updates);

    // If status changed, push notification
    if (status && status !== task.status) {
      const otherUserEmails = role === 'developer'
        ? project.clients
        : [await db.users.findById(project.developerId).then(u => u?.email)];

      for (const mail of otherUserEmails) {
        if (!mail) continue;
        const recipient = await db.users.findOne({ email: mail.toLowerCase() });
        if (recipient && recipient._id !== userId) {
          await db.notifications.create({
            userId: recipient._id || recipient.id,
            projectId: project._id || project.id,
            text: `Task "${task.title}" updated to status ${status.replace('_', ' ').toUpperCase()} by ${req.user.name}`
          });
        }
      }
    }

    return res.json({ task: updatedTask });
  } catch (err: any) {
    console.error('Error updating task:', err);
    return res.status(500).json({ error: 'Server error while updating task' });
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req: any, res: any) => {
  const { id } = req.params;
  const { id: userId, email, role } = req.user;

  try {
    const task = await db.tasks.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const project = await db.projects.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isDeveloper = role === 'developer' && project.developerId === userId;
    if (!isDeveloper) {
      return res.status(403).json({ error: 'Only the project developer can delete tasks' });
    }

    await db.tasks.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting task:', err);
    return res.status(500).json({ error: 'Server error while deleting task' });
  }
});

export default router;
