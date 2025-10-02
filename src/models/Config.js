import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  configType: {
    type: String,
    required: true,
    unique: true,
    enum: ['permissions', 'modelConfig', 'companyInfo', 'panelConfig', 'smtpConfig', 'apiKeys', 'backupSchedule', 'googleDrive']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Config', configSchema);
