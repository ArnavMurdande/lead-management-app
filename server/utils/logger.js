const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, details = '', req = null) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress) : '';
    
    await ActivityLog.create({
      user: userId,
      action,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to save activity log:', error);
  }
};

module.exports = { logActivity };