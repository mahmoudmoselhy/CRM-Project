const asyncHandler = require('../../utils/asyncHandler');
const leads = require('./leads.service');

const list = asyncHandler(async (req, res) => {
  const data = await leads.listLeads(req.user.companyId, req.query);
  res.json({ success: true, leads: data });
});

const getOne = asyncHandler(async (req, res) => {
  const lead = await leads.getLead(req.user.companyId, req.params.id);
  res.json({ success: true, lead });
});

const create = asyncHandler(async (req, res) => {
  const lead = await leads.createLead(req.user.companyId, req.user.userId, req.body);
  res.status(201).json({ success: true, lead });
});

const update = asyncHandler(async (req, res) => {
  const lead = await leads.updateLead(req.user.companyId, req.user.userId, req.params.id, req.body);
  res.json({ success: true, lead });
});

const assign = asyncHandler(async (req, res) => {
  const lead = await leads.assignLead(req.user.companyId, req.user.userId, req.params.id, req.body.assignedTo);
  res.json({ success: true, lead });
});

const changeStatus = asyncHandler(async (req, res) => {
  const lead = await leads.changeStatus(req.user.companyId, req.user.userId, req.params.id, req.body.status);
  res.json({ success: true, lead });
});

const remove = asyncHandler(async (req, res) => {
  await leads.deleteLead(req.user.companyId, req.params.id);
  res.json({ success: true });
});

module.exports = { list, getOne, create, update, assign, changeStatus, remove };
