import express from 'express';
import Conversation from '../models/Conversation.js';
import { requireAuth, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// GET /api/chat/logs - Get chat logs with pagination
router.get('/logs', checkPermission('canViewChatLogs'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { 'messages.text': { $regex: search, $options: 'i' } }
      ];
    }

    const conversations = await Conversation.find(query)
      .populate('user', 'username firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startTime: -1 });

    const count = await Conversation.countDocuments(query);

    res.json({
      logs: conversations.map(c => ({
        id: c._id.toString(),
        user: {
          username: c.user.username,
          firstName: c.user.firstName,
          lastName: c.user.lastName
        },
        firstMessage: c.messages[0]?.text || '',
        startTime: c.startTime.getTime(),
        messageCount: c.messages.length
      })),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get chat logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chat logs' });
  }
});

// GET /api/chat/logs/:id - Get specific conversation
router.get('/logs/:id', checkPermission('canViewChatLogs'), async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('user', 'username firstName lastName email mobile role emailVerified');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({
      id: conversation._id.toString(),
      user: conversation.user,
      startTime: conversation.startTime.getTime(),
      messages: conversation.messages.map(m => ({
        id: m._id.toString(),
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp.getTime(),
        isError: m.isError,
        feedback: m.feedback
      }))
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
});

// POST /api/chat/feedback - Submit feedback
router.post('/feedback', async (req, res) => {
  try {
    const { conversationId, messageId, feedback } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const message = conversation.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    message.feedback = feedback;
    await conversation.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
});

// POST /api/chat/save - Save conversation (for clients)
router.post('/save', async (req, res) => {
  try {
    const { messages } = req.body;

    const conversation = new Conversation({
      user: req.session.userId,
      messages
    });

    await conversation.save();
    res.json({ success: true, conversationId: conversation._id });
  } catch (error) {
    console.error('Save conversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to save conversation' });
  }
});

export default router;
