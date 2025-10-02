import express from 'express';
import User from '../models/User.js';
import { requireAuth, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all user routes
router.use(requireAuth);

// GET /api/users - Get all users with pagination and filters
router.get('/', checkPermission('canManageUsers'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users: users.map(u => ({
        username: u.username,
        password: u.password ? '***' : undefined,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        mobile: u.mobile,
        role: u.role,
        emailVerified: u.emailVerified,
        ip: u.lastLogin?.ip || 'N/A',
        device: u.lastLogin?.device || 'N/A',
        os: u.lastLogin?.os || 'N/A'
      })),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// POST /api/users - Create new user
router.post('/', checkPermission('canManageUsers'), async (req, res) => {
  try {
    const { username, password, firstName, lastName, email, mobile, role } = req.body;

    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    const user = new User({
      username: username.toLowerCase(),
      password,
      firstName,
      lastName,
      email: email.toLowerCase(),
      mobile: mobile || '',
      role: role || 'client',
      emailVerified: false
    });

    await user.save();

    res.json({
      success: true,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// PUT /api/users/:username - Update user
router.put('/:username', checkPermission('canManageUsers'), async (req, res) => {
  try {
    const { username } = req.params;
    const updateData = req.body;

    // Remove password if empty string
    if (updateData.password === '') {
      delete updateData.password;
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    Object.assign(user, updateData);
    await user.save();

    // Update session if user is updating themselves
    if (req.session.user && req.session.user.username === username) {
      req.session.user = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        emailVerified: user.emailVerified
      };
    }

    res.json({
      success: true,
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// DELETE /api/users/:username - Delete user
router.delete('/:username', checkPermission('canManageUsers'), async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOneAndDelete({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// POST /api/users/import - Import multiple users
router.post('/import', checkPermission('canImportUsers'), async (req, res) => {
  try {
    const users = req.body;
    let created = 0;
    let updated = 0;

    for (const userData of users) {
      const existingUser = await User.findOne({ username: userData.username.toLowerCase() });

      if (existingUser) {
        Object.assign(existingUser, userData);
        await existingUser.save();
        updated++;
      } else {
        const newUser = new User({
          ...userData,
          username: userData.username.toLowerCase(),
          email: userData.email.toLowerCase()
        });
        await newUser.save();
        created++;
      }
    }

    res.json({
      success: true,
      message: `Import complete. ${created} users created, ${updated} users updated.`
    });
  } catch (error) {
    console.error('Import users error:', error);
    res.status(500).json({ success: false, message: 'Failed to import users' });
  }
});

// POST /api/users/:username/update-password - Update user password
router.post('/:username/update-password', requireAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Only allow users to change their own password or admins to change any
    if (req.session.user.username !== username && req.session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
});

// POST /api/users/:username/register-passkey - Register passkey
router.post('/:username/register-passkey', requireAuth, async (req, res) => {
  try {
    const { username } = req.params;

    // Only allow users to register passkey for themselves
    if (req.session.user.username !== username) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // In production, implement WebAuthn passkey registration
    // For now, just mock it
    user.passkeyCredentials = [{
      credentialId: 'mock-credential-id',
      publicKey: 'mock-public-key',
      counter: 0
    }];
    await user.save();

    res.json({ success: true, message: 'Passkey registered successfully' });
  } catch (error) {
    console.error('Register passkey error:', error);
    res.status(500).json({ success: false, message: 'Failed to register passkey' });
  }
});

export default router;
