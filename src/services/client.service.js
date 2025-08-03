const pool = require('../config/db');

class Client {
    async update_user(user_data) {
        try {
            const {
                id,
                last_name,
                first_name, 
                middle_name, 
                email, 
                phone
            } = user_data;

            const sql = `
                UPDATE Clients SET 
                last_name = '${last_name}',
                first_name = '${first_name}',
                middle_name = '${middle_name}',
                email = '${email}',
                phone = '${phone}'
                WHERE Clients.id = ${id}
                RETURNING *
            `;
            const {rows} = await pool.query(sql);

            const user = {
                id: id,
                last_name: rows[0].last_name,
                first_name: rows[0].first_name,
                middle_name: rows[0].middle_name,
                email: rows[0].email,
                phone: rows[0].phone
            }

            console.log(user);

            return user;
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = new Client();