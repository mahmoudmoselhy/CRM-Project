const prisma = require('../../config/db');

const OPEN_STATUSES = ['NEW', 'CONTACTED', 'FOLLOW_UP'];
const LEAD_STATUSES = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'WON', 'LOST'];

async function getOverview(companyId) {
  const [total, won, lost, openLeads, pendingTasks, overdueTasks] = await Promise.all([
    prisma.lead.count({ where: { companyId } }),
    prisma.lead.count({ where: { companyId, status: 'WON' } }),
    prisma.lead.count({ where: { companyId, status: 'LOST' } }),
    prisma.lead.count({ where: { companyId, status: { in: OPEN_STATUSES } } }),
    prisma.task.count({ where: { companyId, status: { not: 'COMPLETED' } } }),
    prisma.task.count({
      where: { companyId, status: { not: 'COMPLETED' }, dueDate: { lt: new Date() } },
    }),
  ]);

  const closed = won + lost;
  const conversionRate = closed > 0 ? Math.round((won / closed) * 100) : 0;

  return { total, won, lost, openLeads, pendingTasks, overdueTasks, conversionRate };
}

async function getLeadsByStatus(companyId) {
  const grouped = await prisma.lead.groupBy({
    by: ['status'],
    where: { companyId },
    _count: { _all: true },
  });
  return LEAD_STATUSES.map((status) => ({
    status,
    count: grouped.find((g) => g.status === status)?._count._all || 0,
  }));
}

async function getAgentPerformance(companyId) {
  const users = await prisma.user.findMany({
    where: { companyId },
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' },
  });

  const rows = [];
  for (const u of users) {
    const [leads, won, openTasks] = await Promise.all([
      prisma.lead.count({ where: { companyId, assignedTo: u.id } }),
      prisma.lead.count({ where: { companyId, assignedTo: u.id, status: 'WON' } }),
      prisma.task.count({ where: { companyId, assignedTo: u.id, status: { not: 'COMPLETED' } } }),
    ]);
    rows.push({ id: u.id, name: u.name, role: u.role, leads, won, openTasks });
  }
  return rows;
}

async function getSourcePerformance(companyId) {
  const sources = await prisma.leadSource.findMany({
    where: { companyId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const rows = [];
  for (const s of sources) {
    const [leads, won] = await Promise.all([
      prisma.lead.count({ where: { companyId, sourceId: s.id } }),
      prisma.lead.count({ where: { companyId, sourceId: s.id, status: 'WON' } }),
    ]);
    rows.push({ id: s.id, name: s.name, leads, won });
  }
  return rows;
}

module.exports = { getOverview, getLeadsByStatus, getAgentPerformance, getSourcePerformance };
