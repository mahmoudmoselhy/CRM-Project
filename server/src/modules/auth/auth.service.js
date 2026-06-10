const bcrypt = require('bcrypt');
const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { signToken } = require('../../utils/jwt');
const { EXTENSION_KEYS } = require('../../utils/constants');

const stripPassword = (user) => {
  const { password, ...rest } = user;
  return rest;
};

// Registers a new company and its first ADMIN user, and seeds the extension flags.
async function registerCompany({ companyName, name, email, password }) {
  if (!companyName || !name || !email || !password) {
    throw new ApiError(400, 'companyName, name, email and password are required');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Email already in use');

  const hash = await bcrypt.hash(password, 10);

  const company = await prisma.company.create({
    data: {
      name: companyName,
      users: { create: { name, email, password: hash, role: 'ADMIN' } },
      features: { create: EXTENSION_KEYS.map((key) => ({ key, enabled: false })) },
    },
    include: { users: true },
  });

  const user = company.users[0];
  const token = signToken({ userId: user.id, companyId: company.id, role: user.role });

  return { token, user: stripPassword(user) };
}

async function login({ email, password }) {
  if (!email || !password) throw new ApiError(400, 'email and password are required');

  const user = await prisma.user.findUnique({
    where: { email },
    include: { permissions: true },
  });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new ApiError(401, 'Invalid credentials');

  const token = signToken({ userId: user.id, companyId: user.companyId, role: user.role });
  return { token, user: stripPassword(user) };
}

module.exports = { registerCompany, login };
