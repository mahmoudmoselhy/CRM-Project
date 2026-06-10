const asyncHandler = require('../../utils/asyncHandler');
const usersService = require('./users.service');

const list = asyncHandler(async (req, res) => {
  const users = await usersService.listUsers(req.user.companyId);
  res.json({ success: true, users });
});

// Lightweight id+name list for assignment dropdowns (any authenticated user).
const assignable = asyncHandler(async (req, res) => {
  const users = await usersService.listAssignable(req.user.companyId);
  res.json({ success: true, users });
});

const create = asyncHandler(async (req, res) => {
  const user = await usersService.createUser(req.user.companyId, req.body);
  res.status(201).json({ success: true, user });
});

const getPermissions = asyncHandler(async (req, res) => {
  const permissions = await usersService.getPermissions(req.user.companyId, req.params.id);
  res.json({ success: true, permissions });
});

const setPermissions = asyncHandler(async (req, res) => {
  const permissions = await usersService.setPermissions(
    req.user.companyId,
    req.params.id,
    req.body.permissions || {}
  );
  res.json({ success: true, permissions });
});

module.exports = { list, assignable, create, getPermissions, setPermissions };
