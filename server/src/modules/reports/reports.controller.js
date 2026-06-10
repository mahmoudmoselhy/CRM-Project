const asyncHandler = require('../../utils/asyncHandler');
const reports = require('./reports.service');

const overview = asyncHandler(async (req, res) => {
  res.json({ success: true, overview: await reports.getOverview(req.user.companyId) });
});

const leadsByStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await reports.getLeadsByStatus(req.user.companyId) });
});

const agents = asyncHandler(async (req, res) => {
  res.json({ success: true, agents: await reports.getAgentPerformance(req.user.companyId) });
});

const sources = asyncHandler(async (req, res) => {
  res.json({ success: true, sources: await reports.getSourcePerformance(req.user.companyId) });
});

module.exports = { overview, leadsByStatus, agents, sources };
