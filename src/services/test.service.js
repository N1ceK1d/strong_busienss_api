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

}

module.exports = new Tests();