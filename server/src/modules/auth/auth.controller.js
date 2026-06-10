const asyncHandler = require('../../utils/asyncHandler');
const prisma = require('../../config/db');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerCompany(req.body);
  res.status(201).json({ success: true, ...result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, ...result });
});

// Returns the current user with permissions and the company's feature flags.
const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: {
      permissions: true,
      company: { include: { features: true } },
    },
  });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const { password, ...safe } = user;
  res.json({ success: true, user: safe });
});

module.exports = { register, login, me };
