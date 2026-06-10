const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

// Tasks now carry their own companyId, so they can be general (no lead) or lead-linked.
async function ensureLeadInCompany(companyId, leadId) {
  const lead = await prisma.lead.findFirst({ where: { id: leadId, companyId } });
  if (!lead) throw new ApiError(404, 'Lead not found');
  return lead;
}

async function getTaskInCompany(companyId, id) {
  const task = await prisma.task.findFirst({ where: { id, companyId } });
  if (!task) throw new ApiError(404, 'Task not found');
  return task;
}

async function logActivity(leadId, userId, action, details) {
  if (!leadId) return;
  await prisma.activityLog.create({ data: { leadId, userId: userId || null, action, details } });
}

async function listTasks(companyId, { status, assignedTo, overdue, leadId, scope } = {}) {
  const where = { companyId };
  if (assignedTo) where.assignedTo = assignedTo;
  if (leadId) where.leadId = leadId;
  if (scope === 'general') where.leadId = null; // team tasks not tied to a lead

  if (overdue === 'true' || overdue === true) {
    where.dueDate = { lt: new Date() };
    where.status = { not: 'COMPLETED' };
  } else if (status) {
    where.status = status;
  }

  return prisma.task.findMany({
    where,
    include: {
      lead: { select: { id: true, customerName: true } },
      agent: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: 'asc' },
  });
}

async function createTask(companyId, userId, data) {
  const { leadId, title, dueDate, assignedTo, notes } = data;
  if (!title || !dueDate) throw new ApiError(400, 'title and dueDate are required');
  if (leadId) await ensureLeadInCompany(companyId, leadId);

  const task = await prisma.task.create({
    data: {
      companyId,
      leadId: leadId || null,
      title,
      notes: notes || null,
      dueDate: new Date(dueDate),
      assignedTo: assignedTo || null,
      status: 'PENDING',
    },
  });
  await logActivity(leadId, userId, 'TASK', `Task created: ${title}`);
  return task;
}

async function updateTask(companyId, id, data) {
  await getTaskInCompany(companyId, id);
  const { title, notes, dueDate, assignedTo } = data;
  return prisma.task.update({
    where: { id },
    data: {
      title,
      notes,
      ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      ...(assignedTo !== undefined ? { assignedTo: assignedTo || null } : {}),
    },
  });
}

async function changeStatus(companyId, userId, id, status) {
  if (!status) throw new ApiError(400, 'status is required');
  const task = await getTaskInCompany(companyId, id);
  const updated = await prisma.task.update({ where: { id }, data: { status } });
  if (status === 'COMPLETED') {
    await logActivity(task.leadId, userId, 'TASK', `Task completed: ${task.title}`);
  }
  return updated;
}

async function deleteTask(companyId, id) {
  await getTaskInCompany(companyId, id);
  await prisma.task.delete({ where: { id } });
}

module.exports = { listTasks, createTask, updateTask, changeStatus, deleteTask };
