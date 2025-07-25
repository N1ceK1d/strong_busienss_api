const test_service = require('../services/test.service');

exports.get_tests = async (req, res, next) => {
    try {
        const tests_list = await test_service.get_tests();
        await res.json(tests_list);
    } catch (err) {
        next(err);
    }
}