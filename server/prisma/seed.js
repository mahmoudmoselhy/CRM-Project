require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { EXTENSION_KEYS } = require('../src/utils/constants');

const prisma = new PrismaClient();

// Full permissions helper for an agent on a given module.
const full = { canView: true, canCreate: true, canEdit: true, canDelete: true };
const viewOnly = { canView: true, canCreate: false, canEdit: false, canDelete: false };
const viewEdit = { canView: true, canCreate: true, canEdit: true, canDelete: false };

async function main() {
  console.log('Seeding...');

  // Clean slate (order matters because of foreign keys)
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.leadSource.deleteMany();
  await prisma.companyFeature.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  // ---------- Company A: Maysan ----------
  const maysan = await prisma.company.create({
    data: {
      name: 'Maysan IT Solutions',
      primaryColor: '#1A5276',
      secondaryColor: '#AED6F1',
      features: {
        create: EXTENSION_KEYS.map((key) => ({
          key,
          // turn two extensions on so the Apps page has something enabled
          enabled: key === 'AI_ASSISTANT' || key === 'PDF_INVOICES',
        })),
      },
      users: {
        create: [
          { name: 'Ahmed (Admin)', email: 'admin@maysan.com', password, role: 'ADMIN' },
          {
            name: 'Mona (Manager)',
            email: 'manager@maysan.com',
            password,
            role: 'MANAGER',
            permissions: {
              create: [
                { module: 'LEADS', ...full },
                { module: 'TASKS', ...full },
                { module: 'INVOICES', ...viewEdit },
                { module: 'REPORTS', ...viewOnly },
                { module: 'USERS', ...viewOnly },
              ],
            },
          },
          {
            name: 'Sara (Agent - leads only)',
            email: 'agent1@maysan.com',
            password,
            role: 'AGENT',
            permissions: {
              create: [
                { module: 'LEADS', ...viewEdit },
                { module: 'TASKS', ...full },
              ],
            },
          },
          {
            name: 'Khaled (Agent - view only)',
            email: 'agent2@maysan.com',
            password,
            role: 'AGENT',
            permissions: {
              create: [
                { module: 'LEADS', ...viewOnly },
                { module: 'TASKS', ...viewOnly },
              ],
            },
          },
        ],
      },
    },
    include: { users: true },
  });

  // A lead source + a few leads for company A
  const source = await prisma.leadSource.create({
    data: { companyId: maysan.id, name: 'Facebook Ads' },
  });

  const agentSara = maysan.users.find((u) => u.email === 'agent1@maysan.com');

  const omar = await prisma.lead.create({
    data: { companyId: maysan.id, sourceId: source.id, assignedTo: agentSara.id, customerName: 'Omar Hassan', phone: '0551112233', status: 'NEW' },
  });
  await prisma.lead.create({
    data: { companyId: maysan.id, sourceId: source.id, assignedTo: agentSara.id, customerName: 'Layla Ahmed', phone: '0554445566', status: 'CONTACTED' },
  });
  await prisma.lead.create({
    data: { companyId: maysan.id, customerName: 'Tariq Saleh', phone: '0557778899', status: 'FOLLOW_UP' },
  });
  await prisma.lead.create({
    data: { companyId: maysan.id, customerName: 'Nour Adel', phone: '0551231231', status: 'WON' },
  });

  const day = 24 * 60 * 60 * 1000;
  await prisma.task.createMany({
    data: [
      // lead-linked tasks
      { companyId: maysan.id, leadId: omar.id, assignedTo: agentSara.id, title: 'Call Omar Hassan', dueDate: new Date(Date.now() - day), status: 'PENDING' }, // overdue
      { companyId: maysan.id, leadId: omar.id, assignedTo: agentSara.id, title: 'Send price quote', dueDate: new Date(Date.now() + day), status: 'PENDING' },
      // general team task (no lead)
      { companyId: maysan.id, assignedTo: null, title: 'Weekly team sync', dueDate: new Date(Date.now() + 2 * day), status: 'PENDING' },
    ],
  });

  // ---------- Company B: to prove tenant isolation ----------
  await prisma.company.create({
    data: {
      name: 'Three Way Car Service',
      primaryColor: '#922B21',
      secondaryColor: '#F5B7B1',
      features: { create: EXTENSION_KEYS.map((key) => ({ key, enabled: false })) },
      users: {
        create: [
          { name: 'Owner (Admin)', email: 'admin@threeway.com', password, role: 'ADMIN' },
        ],
      },
    },
  });

  console.log('Done.');
  console.log('Login with any of these (password: password123):');
  console.log('  admin@maysan.com      (ADMIN  - sees everything)');
  console.log('  manager@maysan.com    (MANAGER)');
  console.log('  agent1@maysan.com     (AGENT  - leads view/create/edit + tasks)');
  console.log('  agent2@maysan.com     (AGENT  - view only)');
  console.log('  admin@threeway.com    (other company - isolated data)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
