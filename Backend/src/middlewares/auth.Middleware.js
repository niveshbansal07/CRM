 const jwt = require('jsonwebtoken');
const User = require('../models/User');
 
 const allowRoles = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();
  };
};





const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

const authorizeSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Super admin only' });
  }
  next();
};

module.exports = { authenticate, authorizeSuperAdmin };

module.exports = {
  allowRoles,
  authenticate,
  authorizeSuperAdmin,
};