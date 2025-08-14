const pool = require('../config/db');

module.exports = async (req, res, next) => {
  // Пропускаем публичные маршруты
  if (req.path.startsWith('/auth') || 
      req.path === '/tariffs' ||
      req.path === '/pay') {
    return next();
  }

  try {
    // Объединяем запросы в один
    const result = await pool.query(
      `SELECT ca.expiry_date 
       FROM client_access ca
       JOIN client_tariffs ct ON ca.tariff_id = ct.id
       WHERE ca.client_id = $1 AND ca.expiry_date > NOW()
       LIMIT 1`,
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