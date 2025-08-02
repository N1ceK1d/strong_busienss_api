const express = require('express');
const router = express.Router();
const test_controller = require('../controllers/test.controller');
const auth_controller = require('../controllers/auth.controller');

const app = express();

router.get('/get_tests', test_controller.get_tests);
router.get('/get_questions/:test_id', test_controller.get_questions);

router.get('/get_OCA_results/:company_id', test_controller.get_OCA_test);
router.get('/get_ToneScale/:company_id', test_controller.get_ToneScale);
router.get('/get_iq_results/:company_id', test_controller.get_IQ_result);
router.get('/get_motivations/:company_id', test_controller.get_motivations);
router.get('/get_directors/:company_id', test_controller.get_directors);
router.get('/get_employee/:company_id', test_controller.get_employee);

router.post('/login', auth_controller.login);
router.post('/register', auth_controller.register);
router.post('/save_answers', test_controller.save_answers);

module.exports = router;

