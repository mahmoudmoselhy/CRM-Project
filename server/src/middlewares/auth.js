const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

// Reads the Bearer token, verifies it, and attaches { userId, companyId, role } to req.user.
const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Authentication required');

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }
};

module.exports = authenticate;
