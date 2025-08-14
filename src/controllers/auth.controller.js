const pool = require('../config/db');
const { generateToken } = require('../services/jwt');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  const { email, password, first_name, last_name, middle_name, company, phone } = req.body;
  
  try {
    // Проверка обязательных полей
    const requiredFields = ['email', 'password', 'first_name', 'last_name', 'phone'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Необходимо заполнить все обязательные поля',
        missing: missingFields
      });
    }

    // Проверка существования пользователя
    const userExists = await pool.query(
      'SELECT id FROM Clients WHERE email = $1', 
      [email]
    );
    
    if (userExists.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Пользователь с таким email уже существует'
      });
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание компании
    let companyId = null;
    if (company) {
      const companyRes = await pool.query(
        `INSERT INTO companies (name) 
         VALUES ($1) 
         ON CONFLICT (name) DO NOTHING
         RETURNING id`,
        [company]
      );
      companyId = companyRes.rows[0]?.id;
    }

    // Создание пользователя
    const newUser = await pool.query(
      `INSERT INTO Clients 
       (email, password, first_name, last_name, middle_name, company_id, phone) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, email, first_name, last_name, middle_name, company_id, phone`,
      [email, hashedPassword, first_name, last_name, middle_name, companyId, phone]
    );

    // Генерация токена
    const token = generateToken(newUser.rows[0].id);

    res.status(201).json({
      token,
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера'
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Поиск пользователя
    const user = await pool.query(
      `SELECT Clients.*, Companies.name as company
       FROM Clients
       LEFT JOIN Companies ON Clients.company_id = Companies.id
       WHERE email = $1`,
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(
      password, 
      user.rows[0].password
    );

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Генерация токена
    const token = generateToken(user.rows[0].id);
    
    // Формируем ответ
    const userData = {
      id: user.rows[0].id,
      email: user.rows[0].email,
      first_name: user.rows[0].first_name,
      last_name: user.rows[0].last_name,
      middle_name: user.rows[0].middle_name,
      company_id: user.rows[0].company_id,
      company: user.rows[0].company,
      phone: user.rows[0].phone
    };

    res.json({ token, user: userData });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = { register, login };