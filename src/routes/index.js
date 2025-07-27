const express = require('express');
const router = express.Router();
const test_controller = require('../controllers/test.controller');
const auth_controller = require('../controllers/auth.controller');

const app = express();

router.get('/get_tests', test_controller.get_tests);
router.get('/get_questions/:test_id', test_controller.get_questions);
router.post('/login', auth_controller.login);
router.post('/register', auth_controller.register);

module.exports = router;

