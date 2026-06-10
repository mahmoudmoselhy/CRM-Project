const { Router } = require('express');
const authenticate = require('../../middlewares/auth');
const { register, login, me } = require('./auth.controller');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);

module.exports = router;
