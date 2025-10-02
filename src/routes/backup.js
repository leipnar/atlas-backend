import express from 'express';
import User from '../models/User.js';
import KnowledgeEntry from '../models/KnowledgeEntry.js';
import Conversation from '../models/Conversation.js';
import Config from '../models/Config.js';
import CustomModel from '../models/CustomModel.js';
import { requireAuth, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(checkPermission('canManageBackups'));

// GET /api/backup
router.get('/', async (req, res) => {
  try {
    const { type = 'full' } = req.query;
    const backup = {};

    if (type === 'full' || type === 'database') {
      backup.users = await User.find().lean();
      backup.chatLogs = await Conversation.find().populate('user').lean();
    }

    if (type === 'full' || type === 'knowledgeBase') {
      backup.knowledgeBase = await KnowledgeEntry.find().lean();
    }

    if (type === 'full' || type === 'permissions') {
      const perms = await Config.findOne({ configType: 'permissions' });
      if (perms) backup.permissions = perms.data;
    }

    if (type === 'full' || type === 'modelConfig') {
      const model = await Config.findOne({ configType: 'modelConfig' });
      if (model) backup.modelConfig = model.data;
    }

    if (type === 'full' || type === 'companyInfo') {
      const company = await Config.findOne({ configType: 'companyInfo' });
      if (company) backup.companyInfo = company.data;
    }

    if (type === 'full' || type === 'panelConfig') {
      const panel = await Config.findOne({ configType: 'panelConfig' });
      if (panel) backup.panelConfig = panel.data;
    }

    if (type === 'full' || type === 'smtpConfig') {
      const smtp = await Config.findOne({ configType: 'smtpConfig' });
      if (smtp) backup.smtpConfig = smtp.data;
    }

    if (type === 'full') {
      backup.customOpenRouterModels = await CustomModel.find().lean();
    }

    res.json(backup);
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ success: false, message: 'Failed to create backup' });
  }
});

// POST /api/backup/restore
router.post('/restore', async (req, res) => {
  try {
    const data = req.body;

    if (data.permissions) {
      await Config.findOneAndUpdate(
        { configType: 'permissions' },
        { data: data.permissions },
        { upsert: true }
      );
    }

    if (data.modelConfig) {
      await Config.findOneAndUpdate(
        { configType: 'modelConfig' },
        { data: data.modelConfig },
        { upsert: true }
      );
    }

    if (data.companyInfo) {
      await Config.findOneAndUpdate(
        { configType: 'companyInfo' },
        { data: data.companyInfo },
        { upsert: true }
      );
    }

    if (data.panelConfig) {
      await Config.findOneAndUpdate(
        { configType: 'panelConfig' },
        { data: data.panelConfig },
        { upsert: true }
      );
    }

    if (data.smtpConfig) {
      await Config.findOneAndUpdate(
        { configType: 'smtpConfig' },
        { data: data.smtpConfig },
        { upsert: true }
      );
    }

    if (data.knowledgeBase) {
      await KnowledgeEntry.deleteMany({});
      await KnowledgeEntry.insertMany(data.knowledgeBase);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ success: false, message: 'Failed to restore backup' });
  }
});

// GET /api/backup/schedule
router.get('/schedule', async (req, res) => {
  try {
    const config = await Config.findOne({ configType: 'backupSchedule' });
    res.json(config?.data || { enabled: false, frequency: 'daily', dayOfWeek: 1, time: '02:00' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch backup schedule' });
  }
});

// PUT /api/backup/schedule
router.put('/schedule', async (req, res) => {
  try {
    await Config.findOneAndUpdate(
      { configType: 'backupSchedule' },
      { data: req.body },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update backup schedule' });
  }
});

// GET /api/backup/gdrive
router.get('/gdrive', async (req, res) => {
  try {
    const config = await Config.findOne({ configType: 'googleDrive' });
    res.json(config?.data || { connected: false, email: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch Google Drive config' });
  }
});

// POST /api/backup/gdrive/connect
router.post('/gdrive/connect', async (req, res) => {
  try {
    // In production, implement OAuth flow
    const driveConfig = { connected: true, email: 'example@gmail.com' };
    await Config.findOneAndUpdate(
      { configType: 'googleDrive' },
      { data: driveConfig },
      { upsert: true }
    );
    res.json({ success: true, config: driveConfig });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to connect Google Drive' });
  }
});

// POST /api/backup/gdrive/disconnect
router.post('/gdrive/disconnect', async (req, res) => {
  try {
    const driveConfig = { connected: false, email: null };
    await Config.findOneAndUpdate(
      { configType: 'googleDrive' },
      { data: driveConfig },
      { upsert: true }
    );
    res.json({ success: true, config: driveConfig });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to disconnect Google Drive' });
  }
});

export default router;
