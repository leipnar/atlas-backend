import express from 'express';
import User from '../models/User.js';
import KnowledgeEntry from '../models/KnowledgeEntry.js';
import Conversation from '../models/Conversation.js';
import { requireAuth, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(checkPermission('canViewDashboard'));

// GET /api/stats/activity - Chat activity for last 30 days
router.get('/activity', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activity = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      activity[dateString] = 0;
    }

    const conversations = await Conversation.find({
      startTime: { $gte: thirtyDaysAgo }
    });

    conversations.forEach(convo => {
      const dateString = convo.startTime.toISOString().split('T')[0];
      if (activity[dateString] !== undefined) {
        activity[dateString]++;
      }
    });

    const result = Object.entries(activity)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch activity' });
  }
});

// GET /api/stats/feedback
router.get('/feedback', async (req, res) => {
  try {
    const conversations = await Conversation.find();
    const stats = { good: 0, bad: 0 };

    conversations.forEach(convo => {
      convo.messages.forEach(msg => {
        if (msg.feedback === 'good') stats.good++;
        if (msg.feedback === 'bad') stats.bad++;
      });
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch feedback stats' });
  }
});

// GET /api/stats/kb-count
router.get('/kb-count', async (req, res) => {
  try {
    const count = await KnowledgeEntry.countDocuments();
    res.json(count);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch KB count' });
  }
});

// GET /api/stats/log-count
router.get('/log-count', async (req, res) => {
  try {
    const count = await Conversation.countDocuments();
    res.json(count);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch log count' });
  }
});

// GET /api/stats/role-distribution
router.get('/role-distribution', async (req, res) => {
  try {
    const users = await User.find();
    const distribution = {
      client: 0,
      support: 0,
      supervisor: 0,
      manager: 0,
      admin: 0
    };

    users.forEach(user => {
      distribution[user.role]++;
    });

    res.json(distribution);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch role distribution' });
  }
});

// GET /api/stats/unanswered-count
router.get('/unanswered-count', async (req, res) => {
  try {
    const conversations = await Conversation.find();
    const unansweredResponse = 'I do not have enough information';
    let count = 0;

    conversations.forEach(convo => {
      convo.messages.forEach(msg => {
        if (msg.sender === 'atlas' && msg.text.includes(unansweredResponse)) {
          count++;
        }
      });
    });

    res.json(count);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch unanswered count' });
  }
});

// GET /api/stats/user-count
router.get('/user-count', async (req, res) => {
  try {
    const count = await User.countDocuments({ role: { $ne: 'admin' } });
    res.json(count);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user count' });
  }
});

// GET /api/stats/volume-by-hour
router.get('/volume-by-hour', async (req, res) => {
  try {
    const conversations = await Conversation.find();
    const volumeByHour = Array(24).fill(0);

    conversations.forEach(convo => {
      convo.messages.forEach(msg => {
        if (msg.sender === 'user') {
          const hour = new Date(msg.timestamp).getHours();
          volumeByHour[hour]++;
        }
      });
    });

    res.json(volumeByHour);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch volume by hour' });
  }
});

export default router;
