const express = require('express');
const router = express.Router();
const test_controller = require('../controllers/test.controller');
const auth_controller = require('../controllers/auth.controller');
const client_controller = require('../controllers/client.controller');
const tariffController = require('../controllers/tariff.controller');
const authMiddleware = require('../middleware/auth');
const accessMiddleware = require('../middleware/accessMiddleware');


const pool = require('../config/db');

const app = express();

router.get('/get_tests', test_controller.get_tests);
router.get('/get_questions/:test_id', test_controller.get_questions);
router.delete('/delete_answers', test_controller.delete_answers);

router.get('/get_OCA_results/:company_id', test_controller.get_OCA_test);
router.get('/get_ToneScale/:company_id', test_controller.get_ToneScale);
router.get('/get_iq_results/:company_id', test_controller.get_IQ_result);
router.get('/get_motivations/:company_id', test_controller.get_motivations);
router.get('/get_directors/:company_id', test_controller.get_directors);
router.get('/get_employee/:company_id', test_controller.get_employee);

// router.get('/tariffs', tariff_controller.getTariffs);
// router.post('/tariffs/buy', auth_middleware, tariff_controller.buyTariff);
// router.get('/tariffs/check', auth_middleware, tariff_controller.checkTariff);
// router.get('/user/:user_id/tariff', tariff_controller.getTariffs);

router.post('/login', auth_controller.login);
router.post('/register', auth_controller.register);
router.post('/save_answers', test_controller.save_answers);
router.put('/update_user', client_controller.updateData);


// Получение доступных тарифов
router.get('/tariffs', tariffController.getTariffs);

// Получение активных тарифов клиента
router.get('/client/tariffs', authMiddleware, tariffController.getClientTariffs);

// Покупка тарифов
router.post('/purchase/tariffs', authMiddleware, tariffController.purchaseTariffs);

// Проверка доступа к тесту (пример)
router.get('/test/:test_id', 
  authMiddleware, 
  accessMiddleware, 
  test_controller.get_tests
);

module.exports = router;

