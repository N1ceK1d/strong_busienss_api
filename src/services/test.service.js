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
}

module.exports = new Tests();