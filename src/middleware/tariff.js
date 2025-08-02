// tariffMiddleware.js
const pool = require('../config/db');

module.exports = async (req, res, next) => {
  if (req.path.startsWith('/auth') || req.path === '/tariffs') {
    return next();
  }

  try {
    const result = await pool.query(
      `SELECT 1 FROM client_tariffs 
       WHERE client_id = $1 AND end_date > NOW() AND is_active = TRUE`,
      [req.user.id]
    );

    if (result.rows.length === 0 && !req.user.isAdmin) {
      return res.status(403).json({ 
        error: 'Доступ запрещен. Необходимо приобрести тариф' 
      });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка проверки тарифа' });
  }
};