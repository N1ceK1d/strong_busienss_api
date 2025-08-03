const pool = require('../config/db');
const { delete_answers } = require('../controllers/test.controller');
const {calculate_points} = require('../utils/calculatePoints');

class Tests {

async get_employee(company_id) {
  const query = `
    SELECT 
  u.id AS user_id,
  CASE 
    WHEN u.is_anon = true THEN 'Аноним'
    ELSE COALESCE(CONCAT(u.second_name, ' ', u.first_name), 'Без имени') 
  END AS fullname,
  u.gender,
  u.post_position,
  p.id AS param_id,
  p.name AS param_name,
  SUM(a.points) AS param_score
FROM 
  Users u
JOIN 
  UsersAnswer ua ON u.id = ua.user_id
JOIN 
  Answers a ON ua.answer_id = a.id
JOIN 
  Questions q ON a.question_id = q.id
JOIN 
  Params p ON q.param_id = p.id
WHERE 
  (u.is_director = false OR u.is_director IS NULL) AND
  u.company_id = ${company_id} AND 
  q.test_id = 1
GROUP BY 
  u.id, fullname, u.gender, p.id, p.name
ORDER BY 
  u.id, p.id;
  `;

  try {
    const { rows } = await pool.query(query);
    
    // Группируем результаты по пользователям
    const result = {};
    rows.forEach(row => {
      if (!result[row.user_id]) {
        result[row.user_id] = {
          user_id: row.user_id,
          fullname: row.fullname,
          gender: row.gender,
          post_position: row.post_position,
          params: {}
        };
      }
      result[row.user_id].params[row.param_id] = {
        param_name: row.param_name,
        score: row.param_score
      };
    });
    
    return Object.values(result);
  } catch (error) {
    console.error('Error fetching employee scores with details:', error);
    throw error;
  }
}

async get_directors(company_id) {
  const query = `
    SELECT 
  u.id AS user_id,
  CASE 
    WHEN u.is_anon = true THEN 'Аноним'
    ELSE COALESCE(CONCAT(u.second_name, ' ', u.first_name), 'Без имени') 
  END AS fullname,
  u.gender,
  u.post_position,
  p.id AS param_id,
  p.name AS param_name,
  SUM(a.points) AS param_score
FROM 
  Users u
JOIN 
  UsersAnswer ua ON u.id = ua.user_id
JOIN 
  Answers a ON ua.answer_id = a.id
JOIN 
  Questions q ON a.question_id = q.id
JOIN 
  Params p ON q.param_id = p.id
WHERE 
  (u.is_director = true) AND
  u.company_id = ${company_id} AND 
  q.test_id = 1
GROUP BY 
  u.id, fullname, u.gender, p.id, p.name
ORDER BY 
  u.id, p.id;
  `;

  try {
    const { rows } = await pool.query(query);
    
    // Группируем результаты по пользователям
    const result = {};
    rows.forEach(row => {
      if (!result[row.user_id]) {
        result[row.user_id] = {
          user_id: row.user_id,
          fullname: row.fullname,
          gender: row.gender,
          post_position: row.post_position,
          params: {}
        };
      }
      result[row.user_id].params[row.param_id] = {
        param_name: row.param_name,
        score: row.param_score
      };
    });
    
    return Object.values(result);
  } catch (error) {
    console.error('Error fetching director scores with details:', error);
    throw error;
  }
}

    async get_motivation(company_id) {
        try {
            const sql = `
                WITH user_answers AS (
                    SELECT 
                        u.id AS user_id,
                        CASE 
                            WHEN u.is_anon THEN 'Аноним'
                            ELSE COALESCE(CONCAT(u.second_name, ' ', u.first_name), 'Без имени') 
                        END AS user_name,
                        u.is_anon,
                        a.id AS answer_id,
                        a.answer AS answer_text,
                        a.points,
                        ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY ua.id) AS priority
                    FROM Users u
                    JOIN UsersAnswer ua ON ua.user_id = u.id
                    JOIN Answers a ON ua.answer_id = a.id
                    JOIN Questions q ON a.question_id = q.id
                    WHERE q.id = 526 AND u.company_id = $1
                )
                SELECT 
                    user_id,
                    user_name,
                    is_anon,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'answer_id', answer_id,
                            'answer_text', answer_text,
                            'points', points,
                            'priority', priority
                        )
                        ORDER BY priority ASC
                    ) AS prioritized_answers
                FROM user_answers
                WHERE priority <= 3
                GROUP BY user_id, user_name, is_anon
                ORDER BY is_anon, user_name
            `;
            const { rows } = await pool.query(sql, [company_id]);
            return rows;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async get_IQTest(company_id) {
        try {
            const sql = `
            SELECT 
                u.id as user_id,
                CONCAT(u.second_name, ' ', u.first_name) as fullname,
                u.gender,
                SUM(a.points) as test_points,
                (SUM(a.points) + CASE WHEN u.gender = true THEN 75 ELSE 70 END) as total_points
            FROM 
                Users u
            JOIN 
                UsersAnswer ur ON u.id = ur.user_id
            JOIN 
                Answers a ON ur.answer_id = a.id
            JOIN 
                Questions q ON a.question_id = q.id
            WHERE 
                q.test_id = 3
                AND u.company_id = $1
            GROUP BY 
                u.id, u.second_name, u.first_name, u.gender
            ORDER BY 
                total_points DESC
        `;

        const { rows } = await pool.query(sql, [company_id]);
        
        return rows.map(user => ({
            user_data: {
                id: user.user_id,
                fullname: user.fullname,
                gender: user.gender,
                points: user.total_points,
                test_date: user.test_date
            }
        }));

        } catch (error) {
            console.error('Error in get_IQTest:', error);
            throw new Error('Failed to fetch IQ test results');
        }
    }


    async get_ToneScale(company_id) {
    try {
        const query = `
            SELECT 
                ua.user_id,
                CONCAT(u.second_name, ' ', u.first_name) as fullname,
                a.question_id,
                a.answer,
                q.param_id
            FROM UsersAnswer ua
            JOIN Answers a ON ua.answer_id = a.id
            JOIN Questions q ON a.question_id = q.id
            JOIN Tests t ON q.test_id = t.id
            JOIN Users u ON ua.user_id = u.id
            WHERE t.id = 5
            AND ua.user_id IN (
                SELECT id FROM Users WHERE company_id = ${company_id}
            )
            ORDER BY ua.user_id, q.id
        `;

        const { rows } = await pool.query(query);

        if (!rows.length) {
            return { success: true, data: {} };
        }

        const usersResults = {};
        const userNames = {}; // Отдельный объект для хранения имён
        
        rows.forEach(row => {
            const userId = row.user_id;
            const userFullname = row.fullname;
            const paramId = row.param_id;
            const answer = row.answer;

            // Сохраняем имя пользователя
            userNames[userId] = userFullname;

            // Инициализируем структуру для ответов, если её ещё нет
            if (!usersResults[userId]) {
                usersResults[userId] = {
                    answers: {},
                    fullname: userFullname
                };
            }

            // Добавляем ответы по категориям
            if (!usersResults[userId].answers[paramId]) {
                usersResults[userId].answers[paramId] = [];
            }
            usersResults[userId].answers[paramId].push(answer);
        });

        const results = {};
        for (const userId in usersResults) {
            // Вычисляем результат и сохраняем вместе с именем
            results[userId] = {
                fullname: usersResults[userId].fullname,
                level: await calculate_points(usersResults[userId].answers)
            };
        }

        return {
            success: true,
            data: results
        };

    } catch (error) {
        console.error("Error in get_ToneScale:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

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
            SELECT DISTINCT
                Users.id as user_id, 
                Users.gender as gender,
                Users.test_time as test_time,
                CONCAT(Users.second_name, ' ', Users.first_name) as fullname
            FROM Users
            JOIN UsersAnswer ON UsersAnswer.user_id = Users.id
            JOIN Answers ON UsersAnswer.answer_id = Answers.id
            JOIN Questions ON Answers.question_id = Questions.id
            WHERE Users.company_id = $1
              AND Questions.test_id = 4
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
        SELECT 
            q.*,
            qi.id as image_id,
            qi.image_path
        FROM 
            Questions q
        LEFT JOIN 
            questionimages qi ON q.id = qi.question_id
        WHERE 
            q.test_id = $1
        ORDER BY 
            q.id;
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
                (first_name, second_name, last_name, post_position, gender, is_anon, test_time, company_id, is_director)
            VALUES 
                ($1, $2, $3, $4, $5, false, NOW(), $7, $6)
            RETURNING id`;
            
            params = [
                user_data.firstName,
                user_data.lastName || '', // Добавляем на случай отсутствия
                user_data.middleName,
                user_data.position,
                user_data.gender,
                user_data.isDirector || false,
                user_data.company_id
            ];
        } else {
            sql = `
            INSERT INTO Users 
                (is_anon, test_time, company_id)
            VALUES 
                (true, NOW(), $1)
            RETURNING id`;

            params = [user_data.companyId]
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

    async delete_user_answers(user_id) {
        try {
            console.log(`USER ID: ${user_id}`);
            const delete_answers = `DELETE FROM UsersAnswer WHERE user_id = ${user_id}`;
            pool.query(delete_answers);
            const delete_user = `DELETE FROM Users WHERE id = ${user_id}`;
            pool.query(delete_user);
            return 0;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

}

module.exports = new Tests();