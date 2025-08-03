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
        res.status(200).send('');
    } catch (error) {
        console.error('Failed to save answers', error);
    }
    
}

exports.delete_answers = async (req, res, next) => {
    try {
        console.log(req.body)
        const {user_id} = req.body;
        const result = await test_service.delete_user_answers(user_id);
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
}

exports.get_OCA_test = async (req, res, next) => {
    const company_id = req.params.company_id;
    try {
        const result = await test_service.get_OCATest(company_id);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

exports.get_ToneScale = async (req, res, next) => {
    const company_id = req.params.company_id;
    try {
        const result = await test_service.get_ToneScale(company_id);
        console.log(result)
        res.json(result);
    } catch (error) {
        next(error);
    }
}

exports.get_IQ_result = async (req, res, next) => {
    const company_id = req.params.company_id;
    try {
        const result = await test_service.get_IQTest(company_id);
        console.log(result)
        res.json(result);
    } catch (error) {
        next(error);
    }
}

exports.get_motivations = async (req, res, next) => {
    const company_id = req.params.company_id;
    try {
        const result = await test_service.get_motivation(company_id);
        
        // Форматируем результат для более удобного представления
        const formattedResult = result.map(user => ({
            user_id: user.user_id,
            user_name: user.user_name,
            motivations: user.prioritized_answers.map(answer => ({
                id: answer.answer_id,
                text: answer.answer_text,
                points: answer.points,
                priority: answer.priority
            }))
        }));
        
        res.json(formattedResult);
    } catch (error) {
        next(error);
    }
}

exports.get_employee = async (req, res, next) => {
    const company_id = req.params.company_id;
    try {
        const result = await test_service.get_employee(company_id);
        console.log(result);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error in get_employee controller:', error);
        next(error);
    }
};

exports.get_directors = async (req, res, next) => {
    const company_id = req.params.company_id;
    try {
        const result = await test_service.get_directors(company_id);
        console.log(result);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error in get_directors controller:', error);
        next(error);
    }
};