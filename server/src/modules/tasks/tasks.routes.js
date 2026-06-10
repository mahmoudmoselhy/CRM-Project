const { Router } = require('express');
const authenticate = require('../../middlewares/auth');
const requirePermission = require('../../middlewares/requirePermission');
const c = require('./tasks.controller');

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('TASKS', 'view'), c.list);
router.post('/', requirePermission('TASKS', 'create'), c.create);
router.patch('/:id', requirePermission('TASKS', 'edit'), c.update);
router.patch('/:id/status', requirePermission('TASKS', 'edit'), c.changeStatus);
router.delete('/:id', requirePermission('TASKS', 'delete'), c.remove);

module.exports = router;
