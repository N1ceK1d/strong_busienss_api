const pool = require('../config/db')
const { verifyToken } = require('../services/jwt')

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Получение токена из заголовка
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'Необходима авторизация' })
    }

    // 2. Верификация токена
    const decoded = verifyToken(token)

    // 3. Поиск пользователя в БД
    const user = await pool.query(
      `SELECT id, email, first_name, last_name 
       FROM users WHERE id = $1`,
      [decoded.userId]
    )

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Пользователь не найден' })
    }

    // 4. Добавление пользователя в запрос
    req.user = user.rows[0]
    next()

  } catch (err) {
    res.status(401).json({ error: 'Недействительный токен' })
  }
}

module.exports = authMiddleware