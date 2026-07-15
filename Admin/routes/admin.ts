import express from 'express';
import { db } from '../../Backend/db.js';
import { authenticateToken } from '../../Backend/routes/auth.js';

const router = express.Router();

// Middleware to require admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Admin role required' });
  }
};

// Apply auth and requireAdmin to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// 1. Get system metrics / statistics
router.get('/stats', async (req: any, res: any) => {
  try {
    const totalUsers = await db.users.find({}).then(res => res.length);
    const totalProjects = await db.projects.find({}).then(res => res.length);
    const totalTasks = await db.tasks.find({}).then(res => res.length);
    const totalFeedbacks = await db.feedbacks.find({}).then(res => res.length);
    const totalMessages = await db.messages.find({}).then(res => res.length);

    const activeProjects = await db.projects.find({ status: 'active' }).then(res => res.length);
    const resolvedFeedbacks = await db.feedbacks.find({ resolved: true }).then(res => res.length);

    res.json({
      totalUsers,
      totalProjects,
      totalTasks,
      totalFeedbacks,
      totalMessages,
      activeProjects,
      resolvedFeedbacks,
    });
  } catch (err: any) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Server error while fetching system stats' });
  }
});

// 2. Get list of all registered users
router.get('/users', async (req: any, res: any) => {
  try {
    const usersList = await db.users.find({});
    // Map to remove sensitive passwords before sending
    const users = usersList.map((u: any) => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));
    res.json({ users });
  } catch (err: any) {
    console.error('Error fetching admin users list:', err);
    res.status(500).json({ error: 'Server error while fetching users list' });
  }
});

// 3. Delete a user
router.delete('/users/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const userToDelete = await db.users.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToDelete.email === req.user.email) {
      return res.status(400).json({ error: 'You cannot delete yourself!' });
    }

    await db.users.findByIdAndDelete(id);

    // Clean up notifications for deleted user
    await db.notifications.find({ userId: id }).then(async (notifs) => {
      for (const notif of notifs) {
        await db.notifications.findByIdAndDelete(notif._id || notif.id);
      }
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Server error while deleting user' });
  }
});

// 4. Get list of all projects
router.get('/projects', async (req: any, res: any) => {
  try {
    const projectsList = await db.projects.find({});
    const projects = [];

    for (const p of projectsList) {
      const dev = await db.users.findById(p.developerId);
      const tasksCount = await db.tasks.find({ projectId: p._id || p.id }).then(res => res.length);
      const feedbacksCount = await db.feedbacks.find({ projectId: p._id || p.id }).then(res => res.length);
      
      projects.push({
        id: p._id || p.id,
        name: p.name,
        description: p.description,
        developerName: dev ? dev.name : 'Unknown',
        developerEmail: dev ? dev.email : 'Unknown',
        clients: p.clients,
        liveDemoUrl: p.liveDemoUrl,
        status: p.status,
        createdAt: p.createdAt,
        tasksCount,
        feedbacksCount,
      });
    }

    res.json({ projects });
  } catch (err: any) {
    console.error('Error fetching admin projects list:', err);
    res.status(500).json({ error: 'Server error while fetching projects list' });
  }
});

// 5. Delete a project
router.delete('/projects/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const project = await db.projects.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete the project
    await db.projects.findByIdAndDelete(id);

    // Delete associated tasks
    const tasks = await db.tasks.find({ projectId: id });
    for (const t of tasks) {
      await db.tasks.findByIdAndDelete(t._id || t.id);
    }

    // Delete associated feedbacks
    const feedbacks = await db.feedbacks.find({ projectId: id });
    for (const f of feedbacks) {
      await db.feedbacks.findByIdAndDelete(f._id || f.id);
    }

    // Delete associated messages
    const messages = await db.messages.find({ projectId: id });
    for (const m of messages) {
      await db.messages.findByIdAndDelete(m._id || m.id);
    }

    res.json({ success: true, message: 'Project and all associated data deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Server error while deleting project' });
  }
});

// 6. Broadcast notification to all registered users
router.post('/broadcast', async (req: any, res: any) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Announcement message is required' });
  }

  try {
    const users = await db.users.find({});
    for (const u of users) {
      await db.notifications.create({
        userId: u._id || u.id,
        text: `[System Announcement]: ${text}`,
        read: false,
      });
    }

    res.json({ success: true, message: `System announcement broadcasted to all ${users.length} registered users.` });
  } catch (err: any) {
    console.error('Error broadcasting system notification:', err);
    res.status(500).json({ error: 'Server error while broadcasting notification' });
  }
});

export default router;
