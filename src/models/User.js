import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.socialProvider;
    }
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    default: '',
    trim: true
  },
  role: {
    type: String,
    enum: ['client', 'support', 'supervisor', 'manager', 'admin'],
    default: 'client'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  socialProvider: {
    type: String,
    enum: ['google', 'microsoft', null],
    default: null
  },
  passkeyCredentials: [{
    credentialId: String,
    publicKey: String,
    counter: Number
  }],
  lastLogin: {
    ip: String,
    device: String,
    os: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.passkeyCredentials;
  return user;
};

export default mongoose.model('User', userSchema);
