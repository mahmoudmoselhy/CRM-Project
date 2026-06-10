const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

// Small helper so each important action leaves a trace (used by the timeline).
async function logActivity(leadId, userId, action, details) {
  await prisma.activityLog.create({ data: { leadId, userId: userId || null, action, details } });
}

async function listLeads(companyId, { status, q, assignedTo } = {}) {
  return prisma.lead.findMany({
    where: {
      companyId,
      ...(status ? { status } : {}),
      ...(assignedTo ? { assignedTo } : {}),
      ...(q
        ? {
            OR: [
              { customerName: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      agent: { select: { id: true, name: true } },
      source: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getLead(companyId, id) {
  const lead = await prisma.lead.findFirst({
    where: { id, companyId },
    include: {
      agent: { select: { id: true, name: true } },
      source: { select: { id: true, name: true } },
      activities: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!lead) throw new ApiError(404, 'Lead not found');
  return lead;
}

async function createLead(companyId, userId, data) {
  const { customerName, phone, email, status, notes, assignedTo, sourceId } = data;
  if (!customerName) throw new ApiError(400, 'customerName is required');

  const lead = await prisma.lead.create({
    data: {
      companyId,
      customerName,
      phone: phone || null,
      email: email || null,
      notes: notes || null,
      status: status || 'NEW',
      assignedTo: assignedTo || null,
      sourceId: sourceId || null,
    },
  });
  await logActivity(lead.id, userId, 'CREATED', 'Lead created');

  // Auto follow-up task: when a lead enters the system, a task drops to the
  // assigned agent (call-center workflow). Due in 1 day.
  await prisma.task.create({
    data: {
      companyId,
      leadId: lead.id,
      assignedTo: lead.assignedTo,
      title: `Follow up: ${customerName}`,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'PENDING',
    },
  });
  await logActivity(lead.id, userId, 'TASK', 'Auto follow-up task created');

  return lead;
}

async function updateLead(companyId, userId, id, data) {
  await getLead(companyId, id); // verifies the lead belongs to this company
  const { customerName, phone, email, notes } = data;

  const lead = await prisma.lead.update({
    where: { id },
    data: { customerName, phone, email, notes },
  });
  await logActivity(id, userId, 'UPDATED', 'Lead details updated');
  return lead;
}

async function assignLead(companyId, userId, id, assignedTo) {
  await getLead(companyId, id);
  const lead = await prisma.lead.update({
    where: { id },
    data: { assignedTo: assignedTo || null },
  });
  await logActivity(id, userId, 'ASSIGNED', assignedTo ? 'Lead assigned to an agent' : 'Lead unassigned');
  return lead;
}

async function changeStatus(companyId, userId, id, status) {
  if (!status) throw new ApiError(400, 'status is required');
  await getLead(companyId, id);
  const lead = await prisma.lead.update({ where: { id }, data: { status } });
  await logActivity(id, userId, 'STATUS', `Status changed to ${status}`);
  return lead;
}

async function deleteLead(companyId, id) {
  await getLead(companyId, id);
  await prisma.lead.delete({ where: { id } });
}

module.exports = {
  listLeads,
  getLead,
  createLead,
  updateLead,
  assignLead,
  changeStatus,
  deleteLead,
};
