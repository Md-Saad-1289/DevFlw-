import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get current user's notifications
router.get('/', authenticateToken, async (req: any, res: any) => {
  const { id } = req.user;
  try {
    const notifications = await db.notifications.find({ userId: id });
    return res.json({ notifications });
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ error: 'Server error while fetching notifications' });
  }
});

// Mark single notification as read
router.patch('/:id/read', authenticateToken, async (req: any, res: any) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  try {
    const notification = await db.notifications.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await db.notifications.findByIdAndUpdate(id, { read: true });
    return res.json({ notification: updated });
  } catch (err: any) {
    console.error('Error marking notification read:', err);
    return res.status(500).json({ error: 'Server error while updating notification' });
  }
});

// Mark all notifications as read for current user
router.post('/read-all', authenticateToken, async (req: any, res: any) => {
  const { id: userId } = req.user;
  try {
    const userNotifications = await db.notifications.find({ userId });
    for (const notif of userNotifications) {
      if (!notif.read) {
        await db.notifications.findByIdAndUpdate(notif._id || notif.id, { read: true });
      }
    }
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    console.error('Error marking all notifications read:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
