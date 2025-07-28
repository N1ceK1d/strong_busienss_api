const pool = require('../config/db');

class Tests {
    async get_tests(){
        const sql = `
        SELECT Tests.*, 
            (SELECT COUNT(*) FROM Questions WHERE test_id = Tests.id) as question_count
        FROM Tests;`;
        const { rows } = await pool.query(sql);
        return rows;
    }

    async get_questions(test_id) {
        const sql = `
        SELECT * FROM Questions WHERE test_id = $1
        `;
        const {rows} = await pool.query(sql, [test_id]);
        return rows;
    }

    async get_answers (question_id) {
        const sql = `
        SELECT * FROM Answers WHERE question_id = $1;`;
        const {rows} = await pool.query(sql, [question_id]);
        return rows;
    }

    async save_answers(user_data, answers) {
    try {
        let sql;
        let params = [];
        
        if(user_data && user_data.firstName) {
            sql = `
            INSERT INTO Users 
                (first_name, second_name, last_name, post_position, gender, is_anon, test_time, company_id)
            VALUES 
                ($1, $2, $3, $4, $5, false, NOW(), 1)
            RETURNING id`;
            
            params = [
                user_data.firstName,
                user_data.lastName || '', // Добавляем на случай отсутствия
                user_data.middleName,
                user_data.position,
                user_data.gender
            ];
        } else {
            sql = `
            INSERT INTO Users 
                (is_anon, test_time, company_id)
            VALUES 
                (true, NOW(), 1)
            RETURNING id`;
        }

        // Выполняем запрос для создания пользователя
        const {rows} = await pool.query(sql, params);
        const user_id = rows[0].id;

        // Подготавливаем данные для ответов
        const answersValues = answers.map((answer, index) => 
            `($${index * 2 + 1}, $${index * 2 + 2})`
        ).join(',');

        const answersSql = `
            INSERT INTO UsersAnswer 
                (user_id, answer_id)
            VALUES 
                ${answersValues}`;

        // Формируем параметры для ответов
        const answersParams = answers.flatMap(answer => [
            user_id,
            answer.answer_id // Используем answer_id из данных Vue
        ]);

        // Сохраняем ответы
        await pool.query(answersSql, answersParams);

        return {success: true, user_id};
    } catch (error) {
        console.error('Error saving answers:', error);
        throw error;
    }
}

}

module.exports = new Tests();