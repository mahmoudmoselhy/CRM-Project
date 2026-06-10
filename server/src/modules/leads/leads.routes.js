const { Router } = require('express');
const authenticate = require('../../middlewares/auth');
const requirePermission = require('../../middlewares/requirePermission');
const c = require('./leads.controller');

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('LEADS', 'view'), c.list);
router.post('/', requirePermission('LEADS', 'create'), c.create);
router.get('/:id', requirePermission('LEADS', 'view'), c.getOne);
router.patch('/:id', requirePermission('LEADS', 'edit'), c.update);
router.delete('/:id', requirePermission('LEADS', 'delete'), c.remove);
router.patch('/:id/assign', requirePermission('LEADS', 'edit'), c.assign);
router.patch('/:id/status', requirePermission('LEADS', 'edit'), c.changeStatus);

module.exports = router;
