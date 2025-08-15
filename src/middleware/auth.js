const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  try {
    // Проверяем наличие заголовка Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется аутентификация' });
    }
    
    // Извлекаем токен
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Неверный формат токена' });
    }

    // Проверяем и декодируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Проверяем, есть ли userId в декодированном токене
    if (!decoded.userId) {
      return res.status(401).json({ error: 'Неверный формат токена' });
    }

    // Ищем пользователя в базе данных
    const userResult = await pool.query(
      `SELECT Clients.id, email, first_name, last_name, middle_name, company_id, phone, name as company
       FROM Clients
       INNER JOIN Companies ON Clients.company_id = Companies.id WHERE Clients.id = $1`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    // Добавляем информацию о пользователе в запрос
    const user = userResult.rows[0];
    req.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name,
      company_id: user.company_id,
      phone: user.phone,
      company: user.company
    };
    
    next();
  } catch (err) {
    // Конкретизируем тип ошибки
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Срок действия токена истек' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Недействительный токен' });
    }
    
    console.error('Ошибка аутентификации:', err);
    res.status(500).json({ error: 'Ошибка аутентификации' });
  }
};

module.exports = authMiddleware;