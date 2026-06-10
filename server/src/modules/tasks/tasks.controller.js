const asyncHandler = require('../../utils/asyncHandler');
const tasks = require('./tasks.service');

const list = asyncHandler(async (req, res) => {
  const data = await tasks.listTasks(req.user.companyId, req.query);
  res.json({ success: true, tasks: data });
});

const create = asyncHandler(async (req, res) => {
  const task = await tasks.createTask(req.user.companyId, req.user.userId, req.body);
  res.status(201).json({ success: true, task });
});

const update = asyncHandler(async (req, res) => {
  const task = await tasks.updateTask(req.user.companyId, req.params.id, req.body);
  res.json({ success: true, task });
});

const changeStatus = asyncHandler(async (req, res) => {
  const task = await tasks.changeStatus(req.user.companyId, req.user.userId, req.params.id, req.body.status);
  res.json({ success: true, task });
});

const remove = asyncHandler(async (req, res) => {
  await tasks.deleteTask(req.user.companyId, req.params.id);
  res.json({ success: true });
});

module.exports = { list, create, update, changeStatus, remove };
