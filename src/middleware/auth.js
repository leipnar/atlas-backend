// Middleware to check if user is authenticated
export const requireAuth = (req, res, next) => {
  console.log('🔐 Auth check:', {
    hasSession: !!req.session,
    hasUserId: !!req.session?.userId,
    sessionId: req.sessionID,
    cookies: req.headers.cookie
  });

  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
};

// Middleware to check if user has specific role
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check permission based on role permissions config
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin always has all permissions
    if (req.session.user.role === 'admin') {
      return next();
    }

    try {
      const Config = (await import('../models/Config.js')).default;
      const permissionsDoc = await Config.findOne({ configType: 'permissions' });

      if (!permissionsDoc) {
        return res.status(500).json({
          success: false,
          message: 'Permissions not configured'
        });
      }

      const userRole = req.session.user.role;
      const rolePermissions = permissionsDoc.data[userRole];

      if (!rolePermissions || !rolePermissions[permission]) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};
