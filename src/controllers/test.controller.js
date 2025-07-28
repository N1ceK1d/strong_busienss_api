const test_service = require('../services/test.service');

exports.get_tests = async (req, res, next) => {
    try {
        const tests_list = await test_service.get_tests();
        await res.json(tests_list);
    } catch (err) {
        next(err);
    }
}

exports.get_questions = async (req, res, next) => {
    try {
        const { test_id } = req.params;
        const questions_list = await test_service.get_questions(test_id);
        
        const result = [];
        for (const question of questions_list) {
            const answers = await test_service.get_answers(question.id);
            result.push({
                ...question,
                answers: answers
            });
        }

        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.save_answers = async (req, res, next) => {
    console.log(req.body);
    const userData = req.body.user_data;
    const answers = req.body.answers;
    try {
        const result = await test_service.save_answers(userData, answers);
        console.log('Answers saved successfully', result);
    } catch (error) {
        console.error('Failed to save answers', error);
    }
    
}