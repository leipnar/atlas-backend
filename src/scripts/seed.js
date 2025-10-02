import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import KnowledgeEntry from '../models/KnowledgeEntry.js';
import Config from '../models/Config.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/atlas-ai');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await KnowledgeEntry.deleteMany({});
    await Config.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed users
    const users = [
      {
        username: 'admin',
        password: 'password',
        firstName: 'Technical',
        lastName: 'Admin',
        email: 'admin@atlas.local',
        mobile: '123-456-7890',
        role: 'admin',
        emailVerified: true
      },
      {
        username: 'manager',
        password: 'password',
        firstName: 'Manager',
        lastName: 'User',
        email: 'manager@atlas.local',
        mobile: '111-222-3333',
        role: 'manager',
        emailVerified: true
      },
      {
        username: 'client',
        password: 'password',
        firstName: 'Client',
        lastName: 'User',
        email: 'client@atlas.local',
        mobile: '',
        role: 'client',
        emailVerified: true
      }
    ];

    await User.insertMany(users);
    console.log('✅ Seeded users');

    // Seed knowledge base
    const kbEntries = [
      {
        tag: 'Company Hours',
        content: 'We are open Monday to Friday, 9 AM to 6 PM EST.',
        updatedBy: 'admin'
      },
      {
        tag: 'Returns Policy',
        content: 'Products can be returned within 30 days of purchase with a valid receipt.',
        updatedBy: 'admin'
      },
      {
        tag: 'Shipping Information',
        content: 'We offer free shipping on orders over $50. Standard shipping takes 5-7 business days.',
        updatedBy: 'admin'
      }
    ];

    await KnowledgeEntry.insertMany(kbEntries);
    console.log('✅ Seeded knowledge base');

    // Seed configurations
    const configs = [
      {
        configType: 'permissions',
        data: {
          client: { canViewDashboard: false, canManageUsers: false, canManageRoles: false, canManageKB: false, canViewModelConfig: false, canEditModelConfig: false, canViewCompanySettings: false, canEditCompanySettings: false, canViewChatLogs: false, canViewSmtpSettings: false, canEditSmtpSettings: false, canCustomizePanel: false, canManageBackups: false, canImportUsers: false },
          support: { canViewDashboard: true, canManageUsers: false, canManageRoles: false, canManageKB: true, canViewModelConfig: false, canEditModelConfig: false, canViewCompanySettings: false, canEditCompanySettings: false, canViewChatLogs: true, canViewSmtpSettings: false, canEditSmtpSettings: false, canCustomizePanel: false, canManageBackups: false, canImportUsers: false },
          supervisor: { canViewDashboard: true, canManageUsers: true, canManageRoles: false, canManageKB: true, canViewModelConfig: true, canEditModelConfig: false, canViewCompanySettings: true, canEditCompanySettings: false, canViewChatLogs: true, canViewSmtpSettings: false, canEditSmtpSettings: false, canCustomizePanel: false, canManageBackups: false, canImportUsers: true },
          manager: { canViewDashboard: true, canManageUsers: true, canManageRoles: true, canManageKB: true, canViewModelConfig: true, canEditModelConfig: true, canViewCompanySettings: true, canEditCompanySettings: true, canViewChatLogs: true, canViewSmtpSettings: true, canEditSmtpSettings: true, canCustomizePanel: true, canManageBackups: true, canImportUsers: true },
          admin: { canViewDashboard: true, canManageUsers: true, canManageRoles: true, canManageKB: true, canViewModelConfig: true, canEditModelConfig: true, canViewCompanySettings: true, canEditCompanySettings: true, canViewChatLogs: true, canViewSmtpSettings: true, canEditSmtpSettings: true, canCustomizePanel: true, canManageBackups: true, canImportUsers: true }
        }
      },
      {
        configType: 'modelConfig',
        data: {
          provider: 'google',
          model: 'gemini-2.5-flash',
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          customInstruction: 'Be friendly and professional. Keep answers concise.'
        }
      },
      {
        configType: 'companyInfo',
        data: {
          logo: null,
          en: {
            name: 'Atlas Corp.',
            about: 'Welcome to the Atlas AI Assistant. Your partner in providing instant, accurate information.'
          },
          fa: {
            name: 'شرکت اطلس',
            about: 'به دستیار هوش مصنوعی اطلس خوش آمدید. همراه شما در ارائه اطلاعات فوری و دقیق.'
          }
        }
      },
      {
        configType: 'panelConfig',
        data: {
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
        }
      }
    ];

    await Config.insertMany(configs);
    console.log('✅ Seeded configurations');

    console.log('\n✨ Database seeded successfully!');
    console.log('\n📝 Default users created:');
    console.log('   Admin: admin / password');
    console.log('   Manager: manager / password');
    console.log('   Client: client / password\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
