const { Router } = require('express');
const authenticate = require('../../middlewares/auth');
const requirePermission = require('../../middlewares/requirePermission');
const c = require('./reports.controller');

const router = Router();

router.use(authenticate);
router.use(requirePermission('REPORTS', 'view'));

router.get('/overview', c.overview);
router.get('/leads-by-status', c.leadsByStatus);
router.get('/agents', c.agents);
router.get('/sources', c.sources);

module.exports = router;
