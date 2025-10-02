import mongoose from 'mongoose';

const knowledgeEntrySchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastUpdated on save
knowledgeEntrySchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

export default mongoose.model('KnowledgeEntry', knowledgeEntrySchema);
