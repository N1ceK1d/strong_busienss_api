const pool = require('../config/db')
const { generateToken } = require('../services/jwt')
const bcrypt = require('bcryptjs')

const register = async (req, res, next) => {
  const { email, password, first_name, last_name, middle_name, company } = req.body
  
  try {
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ 
        error: 'Все обязательные поля должны быть заполнены',
        details: {
          email: !email ? 'Требуется email' : undefined,
          password: !password ? 'Требуется пароль' : undefined,
          first_name: !first_name ? 'Требуется имя' : undefined,
          last_name: !last_name ? 'Требуется фамилия' : undefined
        }
      });
    }
    // 1. Проверка существования пользователя
    const userExists = await pool.query(
      'SELECT id FROM Clients WHERE email = $1', 
      [email]
    )
    
     if (userExists.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Пользователь с таким email уже существует',
        code: 'EMAIL_EXISTS'
      });
    }

    // 2. Хэширование пароля
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 3. Создание компании (если указана)
    let companyId = null
    if (company) {
      const companyRes = await pool.query(
             `WITH inserted_company AS (
          INSERT INTO companies (name) 
          VALUES ($1)
          ON CONFLICT (name) DO NOTHING
          RETURNING id
        )
        SELECT id FROM inserted_company
        UNION
        SELECT id FROM companies WHERE name = $1`,
        [company]
      )
      companyId = companyRes.rows[0].id
    }

    // 4. Создание пользователя
    const newUser = await pool.query(
      `INSERT INTO Clients 
       (email, password, first_name, last_name, middle_name, company_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [email, hashedPassword, first_name, last_name, middle_name, companyId]
    )

    // 5. Генерация токена
    const token = generateToken(newUser.rows[0].id)

    res.status(201).json({
      token,
      user: newUser.rows[0]
    })

  } catch (err) {
    // Логирование полной ошибки
    console.error('Registration Error:', {
      message: err.message,
      stack: err.stack,
      body: req.body
    });
    
    // Отправка клиенту
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      code: 'INTERNAL_ERROR'
    });
  }
}

const login = async (req, res, next) => {
  const { email, password } = req.body

  try {
    // 1. Поиск пользователя
    const user = await pool.query(
      `SELECT id, email, password, first_name, last_name 
       FROM Clients WHERE email = $1`,
      [email]
    )

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Неверные учетные данные' })
    }

    // 2. Проверка пароля
    const isValidPassword = await bcrypt.compare(
      password, 
      user.rows[0].password_hash
    )

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' })
    }

    // 3. Генерация токена
    const token = generateToken(user.rows[0].id)

    res.json({
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        first_name: user.rows[0].first_name,
        last_name: user.rows[0].last_name,
        company_id: user.rows[0].company_id
      }
    })

  } catch (err) {
    next(err)
  }
}

module.exports = { register, login }