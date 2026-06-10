const { PrismaClient } = require('@prisma/client');

// Single Prisma client instance shared across the app
const prisma = new PrismaClient();

module.exports = prisma;
