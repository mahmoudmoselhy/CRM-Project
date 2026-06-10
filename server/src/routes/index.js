const { Router } = require('express');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'CRM API is running' });
});

router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/users', require('../modules/users/users.routes'));
router.use('/leads', require('../modules/leads/leads.routes'));
router.use('/tasks', require('../modules/tasks/tasks.routes'));
router.use('/reports', require('../modules/reports/reports.routes'));

module.exports = router;
