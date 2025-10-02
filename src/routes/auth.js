import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Update last login info
    user.lastLogin = {
      ip: req.ip,
      device: req.headers['user-agent'] || 'Unknown',
      os: req.headers['user-agent'] || 'Unknown',
      timestamp: new Date()
    };
    await user.save();

    // Store user in session
    req.session.userId = user._id;
    req.session.user = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      emailVerified: user.emailVerified
    };

    // Save session before sending response
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, message: 'Session creation failed' });
      }

      res.json({
        success: true,
        user: req.session.user
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// POST /api/auth/social-login
router.post('/social-login', async (req, res) => {
  try {
    const { provider, token } = req.body;

    // In production, verify the token with the provider
    // For now, create or get user based on provider email
    const email = `${provider}-user@example.com`;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: `${provider}user${Date.now()}`,
        firstName: provider.charAt(0).toUpperCase() + provider.slice(1),
        lastName: 'User',
        email,
        mobile: '',
        role: 'client',
        emailVerified: true,
        socialProvider: provider
      });
      await user.save();
    }

    req.session.userId = user._id;
    req.session.user = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      emailVerified: user.emailVerified
    };

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, message: 'Session creation failed' });
      }
      res.json({ success: true, user: req.session.user });
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ success: false, message: 'Social login failed' });
  }
});

// POST /api/auth/passkey
router.post('/passkey', async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || !user.passkeyCredentials || user.passkeyCredentials.length === 0) {
      return res.status(401).json({ success: false, message: 'Passkey not found' });
    }

    // In production, verify the passkey challenge
    req.session.userId = user._id;
    req.session.user = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, message: 'Session creation failed' });
      }
      res.json({
        success: true,
        user: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Passkey login error:', error);
    res.status(500).json({ success: false, message: 'Passkey login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// GET /api/auth/current-user
router.get('/current-user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.json(null);
  }
});

export default router;
