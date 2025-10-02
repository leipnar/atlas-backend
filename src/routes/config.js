import express from 'express';
import Config from '../models/Config.js';
import CustomModel from '../models/CustomModel.js';
import { requireAuth, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Helper function to get or create config
const getOrCreateConfig = async (configType, defaultData) => {
  let config = await Config.findOne({ configType });
  if (!config) {
    config = new Config({ configType, data: defaultData });
    await config.save();
  }
  return config;
};

// GET /api/config/permissions
router.get('/permissions', async (req, res) => {
  try {
    const config = await getOrCreateConfig('permissions', {
      client: { canViewDashboard: false, canManageUsers: false, canManageRoles: false, canManageKB: false, canViewModelConfig: false, canEditModelConfig: false, canViewCompanySettings: false, canEditCompanySettings: false, canViewChatLogs: false, canViewSmtpSettings: false, canEditSmtpSettings: false, canCustomizePanel: false, canManageBackups: false, canImportUsers: false },
      support: { canViewDashboard: true, canManageUsers: false, canManageRoles: false, canManageKB: true, canViewModelConfig: false, canEditModelConfig: false, canViewCompanySettings: false, canEditCompanySettings: false, canViewChatLogs: true, canViewSmtpSettings: false, canEditSmtpSettings: false, canCustomizePanel: false, canManageBackups: false, canImportUsers: false },
      supervisor: { canViewDashboard: true, canManageUsers: true, canManageRoles: false, canManageKB: true, canViewModelConfig: true, canEditModelConfig: false, canViewCompanySettings: true, canEditCompanySettings: false, canViewChatLogs: true, canViewSmtpSettings: false, canEditSmtpSettings: false, canCustomizePanel: false, canManageBackups: false, canImportUsers: true },
      manager: { canViewDashboard: true, canManageUsers: true, canManageRoles: true, canManageKB: true, canViewModelConfig: true, canEditModelConfig: true, canViewCompanySettings: true, canEditCompanySettings: true, canViewChatLogs: true, canViewSmtpSettings: true, canEditSmtpSettings: true, canCustomizePanel: true, canManageBackups: true, canImportUsers: true },
      admin: { canViewDashboard: true, canManageUsers: true, canManageRoles: true, canManageKB: true, canViewModelConfig: true, canEditModelConfig: true, canViewCompanySettings: true, canEditCompanySettings: true, canViewChatLogs: true, canViewSmtpSettings: true, canEditSmtpSettings: true, canCustomizePanel: true, canManageBackups: true, canImportUsers: true }
    });
    res.json(config.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch permissions' });
  }
});

// PUT /api/config/permissions
router.put('/permissions', checkPermission('canManageRoles'), async (req, res) => {
  try {
    let config = await Config.findOne({ configType: 'permissions' });
    if (!config) {
      config = new Config({ configType: 'permissions', data: req.body });
    } else {
      config.data = req.body;
    }
    await config.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update permissions' });
  }
});

// GET /api/config/model
router.get('/model', checkPermission('canViewModelConfig'), async (req, res) => {
  try {
    const config = await getOrCreateConfig('modelConfig', {
      provider: 'google',
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      customInstruction: 'Be friendly and professional. Keep answers concise.'
    });
    res.json(config.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch model config' });
  }
});

// PUT /api/config/model
router.put('/model', checkPermission('canEditModelConfig'), async (req, res) => {
  try {
    let config = await Config.findOne({ configType: 'modelConfig' });
    if (!config) {
      config = new Config({ configType: 'modelConfig', data: req.body });
    } else {
      config.data = req.body;
    }
    await config.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update model config' });
  }
});

// GET /api/config/company
router.get('/company', checkPermission('canViewCompanySettings'), async (req, res) => {
  try {
    const config = await getOrCreateConfig('companyInfo', {
      logo: null,
      en: { name: 'Atlas Corp.', about: 'Welcome to the Atlas AI Assistant.' },
      fa: { name: 'شرکت اطلس', about: 'به دستیار هوش مصنوعی اطلس خوش آمدید.' }
    });
    res.json(config.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch company info' });
  }
});

// PUT /api/config/company
router.put('/company', checkPermission('canEditCompanySettings'), async (req, res) => {
  try {
    let config = await Config.findOne({ configType: 'companyInfo' });
    if (!config) {
      config = new Config({ configType: 'companyInfo', data: req.body });
    } else {
      config.data = req.body;
    }
    await config.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update company info' });
  }
});

// GET /api/config/panel
router.get('/panel', async (req, res) => {
  try {
    const config = await getOrCreateConfig('panelConfig', {
      aiNameEn: 'Atlas',
      aiNameFa: 'اطلس',
      chatHeaderTitleEn: 'Conversation with Atlas',
      chatHeaderTitleFa: 'گفتگو با اطلس',
      chatPlaceholderEn: 'Type your message here...',
      chatPlaceholderFa: 'پیام خود را اینجا بنویسید...',
      welcomeMessageEn: 'Hello! How can I help you today?',
      welcomeMessageFa: 'سلام! چطور می‌توانم امروز به شما کمک کنم؟',
      aiAvatar: null,
      privacyPolicyEn: 'This is the default Privacy Policy.',
      privacyPolicyFa: 'این متن پیش‌فرض سیاست حفظ حریم خصوصی است.',
      termsOfServiceEn: 'These are the default Terms of Service.',
      termsOfServiceFa: 'این متن پیش‌فرض شرایط خدمات است.'
    });
    res.json(config.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch panel config' });
  }
});

// PUT /api/config/panel
router.put('/panel', checkPermission('canCustomizePanel'), async (req, res) => {
  try {
    let config = await Config.findOne({ configType: 'panelConfig' });
    if (!config) {
      config = new Config({ configType: 'panelConfig', data: req.body });
    } else {
      config.data = req.body;
    }
    await config.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update panel config' });
  }
});

// GET /api/config/smtp
router.get('/smtp', checkPermission('canViewSmtpSettings'), async (req, res) => {
  try {
    const config = await getOrCreateConfig('smtpConfig', {
      host: '',
      port: 587,
      secure: false,
      username: '',
      emailTemplates: {
        passwordReset: { subject: 'Your Password Reset Link', body: 'Hello {{name}},...' },
        emailVerification: { subject: 'Verify Your Email Address', body: 'Hello {{name}},...' }
      }
    });
    res.json(config.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch SMTP config' });
  }
});

// PUT /api/config/smtp
router.put('/smtp', checkPermission('canEditSmtpSettings'), async (req, res) => {
  try {
    let config = await Config.findOne({ configType: 'smtpConfig' });
    if (!config) {
      config = new Config({ configType: 'smtpConfig', data: req.body });
    } else {
      if (req.body.password === '') delete req.body.password;
      config.data = { ...config.data, ...req.body };
    }
    await config.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update SMTP config' });
  }
});

// GET /api/config/api-keys
router.get('/api-keys', checkPermission('canEditModelConfig'), async (req, res) => {
  try {
    const config = await getOrCreateConfig('apiKeys', { google: '', openai: '', openrouter: '' });
    res.json(config.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch API keys' });
  }
});

// POST /api/config/api-keys
router.post('/api-keys', checkPermission('canEditModelConfig'), async (req, res) => {
  try {
    let config = await Config.findOne({ configType: 'apiKeys' });
    if (!config) {
      config = new Config({ configType: 'apiKeys', data: req.body });
    } else {
      config.data = { ...config.data, ...req.body };
    }
    await config.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update API keys' });
  }
});

// Custom OpenRouter Models
router.get('/custom-models', async (req, res) => {
  try {
    const models = await CustomModel.find();
    res.json(models);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch custom models' });
  }
});

router.post('/custom-models', checkPermission('canEditModelConfig'), async (req, res) => {
  try {
    const { id, name } = req.body;
    const existing = await CustomModel.findOne({ id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Model ID already exists' });
    }
    const model = new CustomModel({ id, name });
    await model.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add custom model' });
  }
});

router.put('/custom-models/:id', checkPermission('canEditModelConfig'), async (req, res) => {
  try {
    const model = await CustomModel.findOne({ id: req.params.id });
    if (!model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }
    model.id = req.body.id;
    model.name = req.body.name;
    await model.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update custom model' });
  }
});

router.delete('/custom-models/:id', checkPermission('canEditModelConfig'), async (req, res) => {
  try {
    await CustomModel.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete custom model' });
  }
});

export default router;
