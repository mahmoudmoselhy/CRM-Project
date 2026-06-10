const { Router } = require('express');
const authenticate = require('../../middlewares/auth');
const requireRole = require('../../middlewares/requireRole');
const c = require('./users.controller');

const router = Router();

router.use(authenticate);

router.get('/assignable', c.assignable);
router.get('/', requireRole('ADMIN', 'MANAGER'), c.list);
router.post('/', requireRole('ADMIN'), c.create);
router.get('/:id/permissions', requireRole('ADMIN', 'MANAGER'), c.getPermissions);
router.put('/:id/permissions', requireRole('ADMIN'), c.setPermissions);

module.exports = router;
