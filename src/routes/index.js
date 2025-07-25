const express = require('express');
const router = express.Router();
const test_controller = require('../controllers/test.controller');

const app = express();

router.get('/get_tests', test_controller.get_tests);

module.exports = router;

