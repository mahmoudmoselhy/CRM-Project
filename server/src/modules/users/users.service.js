const bcrypt = require('bcrypt');
const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { PERMISSION_MODULES } = require('../../utils/constants');

// permissions shape from the client:
// { LEADS: { view, create, edit, delete }, TASKS: { ... }, ... }
function buildPermissionRows(permissions = {}) {
  return PERMISSION_MODULES.filter((m) => permissions[m]).map((m) => ({
    module: m,
    canView: !!permissions[m].view,
    canCreate: !!permissions[m].create,
    canEdit: !!permissions[m].edit,
    canDelete: !!permissions[m].delete,
  }));
}

async function listUsers(companyId) {
  return prisma.user.findMany({
    where: { companyId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
}

async function listAssignable(companyId) {
  return prisma.user.findMany({
    where: { companyId },
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' },
  });
}

async function createUser(companyId, { name, email, password, role, permissions }) {
  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Email already in use');

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      companyId,
      name,
      email,
      password: hash,
      role: role || 'AGENT',
      permissions: { create: buildPermissionRows(permissions) },
    },
    include: { permissions: true },
  });

  const { password: _pw, ...safe } = user;
  return safe;
}

async function getPermissions(companyId, userId) {
  const user = await prisma.user.findFirst({
    where: { id: userId, companyId },
    include: { permissions: true },
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user.permissions;
}

// Replaces the whole permission set for a user (simple and predictable).
async function setPermissions(companyId, userId, permissions) {
  const user = await prisma.user.findFirst({ where: { id: userId, companyId } });
  if (!user) throw new ApiError(404, 'User not found');

  const rows = buildPermissionRows(permissions).map((r) => ({ ...r, userId }));

  await prisma.$transaction([
    prisma.userPermission.deleteMany({ where: { userId } }),
    ...rows.map((data) => prisma.userPermission.create({ data })),
  ]);

  return getPermissions(companyId, userId);
}

module.exports = { listUsers, listAssignable, createUser, getPermissions, setPermissions };
