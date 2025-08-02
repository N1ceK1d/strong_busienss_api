const pool = require('../config/db')

exports.getTariffs = async (req, res) => {
  try {
    const tariffs = await pool.query('SELECT * FROM tariffs WHERE is_active = TRUE');
    res.json(tariffs.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения тарифов' });
  }
};

// Покупка тарифа
exports.buyTariff = async (req, res) => {
  const { clientId, tariffId, needConsultant } = req.body;
  
  try {
    // Начинаем транзакцию
    await pool.query('BEGIN');

    // 1. Получаем данные тарифа
    const tariff = await pool.query(
      'SELECT * FROM tariffs WHERE id = $1', 
      [tariffId]
    );
    
    if (tariff.rows.length === 0) {
      return res.status(404).json({ error: 'Тариф не найден' });
    }

    const tariffData = tariff.rows[0];
    const finalPrice = needConsultant ? tariffData.price + 5000 : tariffData.price;

    // 2. Создаем запись о покупке
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + tariffData.duration_days);

    const newTariff = await pool.query(
      `INSERT INTO client_tariffs 
       (client_id, tariff_id, start_date, end_date, price_paid, has_consultant, payment_status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'paid')
       RETURNING *`,
      [clientId, tariffId, startDate, endDate, finalPrice, needConsultant]
    );

    // 3. Обновляем клиента (добавляем ссылку на активный тариф)
    await pool.query(
      'UPDATE clients SET active_tariff_id = $1 WHERE id = $2',
      [newTariff.rows[0].id, clientId]
    );

    // Фиксируем транзакцию
    await pool.query('COMMIT');

    // Отправляем email
    await sendEmail({
      to: req.user.email,
      subject: 'Подтверждение покупки тарифа',
      text: `Вы успешно приобрели тариф "${tariffData.name}"`
    });

    res.json(newTariff.rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Ошибка покупки тарифа' });
  }
};

// Проверка активного тарифа
exports.checkTariff = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ct.*, t.name as tariff_name 
       FROM client_tariffs ct
       JOIN tariffs t ON ct.tariff_id = t.id
       WHERE ct.client_id = $1 AND ct.end_date > NOW() AND ct.is_active = TRUE
       ORDER BY ct.end_date DESC LIMIT 1`,
      [req.user.id]
    );

    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка проверки тарифа' });
  }
};