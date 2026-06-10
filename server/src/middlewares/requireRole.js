const ApiError = require('../utils/ApiError');

// Baseline role gate, e.g. requireRole('ADMIN') or requireRole('ADMIN', 'MANAGER').
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, 'Insufficient role');
  }
  next();
};

module.exports = requireRole;
