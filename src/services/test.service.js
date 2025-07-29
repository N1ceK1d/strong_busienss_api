const pool = require('../config/db');

class Tests {
    async get_OCATest(company_id) {
    try {
        // 1. Получаем параметры теста
        const paramsQuery = `
            SELECT 
                Params.id,
                Params.name
            FROM Params
            JOIN Questions ON Questions.param_id = Params.id
            WHERE Questions.test_id = 4
            GROUP BY Params.id, Params.name
            ORDER BY Params.id
        `;
        const paramsResult = await pool.query(paramsQuery);

        // 2. Получаем пользователей компании
        const usersQuery = `
            SELECT 
                Users.id as user_id, 
                Users.gender as gender,
                Users.test_time as test_time,
                CONCAT(Users.second_name, ' ', Users.first_name) as fullname
            FROM Users
            WHERE company_id = $1
            ORDER BY Users.test_time
        `;
        const usersResult = await pool.query(usersQuery, [company_id]);

        // 3. Получаем баллы по категориям для каждого пользователя
        const scoresQuery = `
            SELECT 
                ua.user_id,
                q.param_id,
                SUM(a.points) as total_score
            FROM UsersAnswer ua
            JOIN Answers a ON ua.answer_id = a.id
            JOIN Questions q ON a.question_id = q.id
            JOIN Users u ON ua.user_id = u.id
            WHERE q.test_id = 4
              AND u.company_id = $1
            GROUP BY ua.user_id, q.param_id
            ORDER BY ua.user_id, q.param_id
        `;
        const scoresResult = await pool.query(scoresQuery, [company_id]);

        // 4. Формируем структуру результатов
        const scores = {};
        scoresResult.rows.forEach(row => {
            if (!scores[row.param_id]) {
                scores[row.param_id] = {};
            }
            scores[row.param_id][row.user_id] = row.total_score;
        });

        // 5. Возвращаем результат
        return {
            users: usersResult.rows,
            params: paramsResult.rows,
            scores: scores
        };
    } catch (error) {
        console.error('Error in get_OCATest:', error);
        throw error;
    }
}

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