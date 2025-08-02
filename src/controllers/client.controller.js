const pool = require('../config/db');

exports.getData = async (req, res, next) => {
    const client_id = req.params.user_id;

    const {rows} = pool.query(`
        SELECT 
        Clients.first_name, Clients.last_name, Clients.middle_name, Clients.email, Clients.phone,
        Clients.id as client_id, Companies.name
        FROM Clients 
        INNER JOIN Companies ON Clients.company_id = Companies.id 
        WHERE Clients.id = ${client_id}`)

    res.json(rows);
}

exports.updateData = async (req, res, next) => {

    const client_id = req.params.user_id;

    const {
    email,
    first_name,
    last_name,
    middle_name,
    phone
  } = req.body;

  // Валидация обязательных полей
  if ( !email || !first_name || !last_name) {
    return res.status(400).json({
      success: false,
      error: 'Обязательные поля: email, first_name, last_name'
    });
  }

  try {
    // Проверяем существование клиента
    const clientExists = await pool.query(
      'SELECT 1 FROM Clients WHERE id = $1',
      [client_id]
    );

    if (clientExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Клиент не найден'
      });
    }

    // Проверяем уникальность email (если изменился)
    const currentEmail = await pool.query(
      'SELECT email FROM Clients WHERE id = $1',
      [client_id]
    );

    if (currentEmail.rows[0].email !== email) {
      const emailExists = await pool.query(
        'SELECT 1 FROM Clients WHERE email = $1 AND id != $2',
        [email, client_id]
      );

      if (emailExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email уже используется другим пользователем'
        });
      }
    }

    // Обновляем данные клиента
    const updateQuery = `
      UPDATE Clients 
      SET 
        email = $1,
        first_name = $2,
        last_name = $3,
        middle_name = $4,
        phone = $5
      WHERE id = $6
      RETURNING *
    `;

    

    const result = await pool.query(updateQuery, [
      email,
      first_name,
      last_name,
      middle_name || null,
      phone || null,
      client_id
    ]);

    // Форматируем ответ
    const updatedClient = result.rows[0];
    const response = {
      id: updatedClient.id,
      email: updatedClient.email,
      first_name: updatedClient.first_name,
      last_name: updatedClient.last_name,
      middle_name: updatedClient.middle_name,
      phone: updatedClient.phone,
      company_id: updatedClient.company_id
    };

    res.json(response);

  } catch (error) {
    console.error('Ошибка при обновлении клиента:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
}