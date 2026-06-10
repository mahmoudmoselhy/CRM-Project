const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

// Company-level feature gate for optional extensions.
// Usage: requireFeature('AI_ASSISTANT')
const requireFeature = (key) => async (req, res, next) => {
  const feature = await prisma.companyFeature.findUnique({
    where: { companyId_key: { companyId: req.user.companyId, key } },
  });

  if (!feature || !feature.enabled) {
    throw new ApiError(403, `Feature '${key}' is not enabled for this company`);
  }
  next();
};

module.exports = requireFeature;
