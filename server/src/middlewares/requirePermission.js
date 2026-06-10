const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

const ACTION_FIELD = {
  view: 'canView',
  create: 'canCreate',
  edit: 'canEdit',
  delete: 'canDelete',
};

// Action-level access gate. ADMIN bypasses; other users are checked against UserPermission.
// Usage: requirePermission('LEADS', 'edit')
const requirePermission = (module, action) => async (req, res, next) => {
  if (req.user.role === 'ADMIN') return next();

  const perm = await prisma.userPermission.findUnique({
    where: { userId_module: { userId: req.user.userId, module } },
  });

  const field = ACTION_FIELD[action];
  if (!perm || !perm[field]) {
    throw new ApiError(403, `No '${action}' permission on ${module}`);
  }
  next();
};

module.exports = requirePermission;
