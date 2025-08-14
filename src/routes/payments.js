// routes/payments.js
const express = require('express')
const router = express.Router()
const pool = require('../config/db')

// Подтверждение платежа
router.post('/confirm', async (req, res) => {
  const { tariff_id, amount, payment_id, system } = req.body
  const client_id = req.user.id

  try {
    await pool.query('BEGIN')
    
    // Сохраняем платеж
    const payment = await pool.query(
      `INSERT INTO payments 
       (client_id, amount, payment_system, payment_status, payment_id, tariff_id)
       VALUES ($1, $2, $3, 'completed', $4, $5)
       RETURNING id`,
      [client_id, amount, system, payment_id, tariff_id]
    )
    
    // Активируем доступ
    const tariff = await pool.query('SELECT * FROM tariffs WHERE id = $1', [tariff_id])
    const expiry_date = tariff.rows[0].duration_days 
      ? new Date(Date.now() + tariff.rows[0].duration_days * 86400000)
      : null
    
    await pool.query(
      `INSERT INTO client_access 
       (client_id, tariff_id, purchase_date, expiry_date)
       VALUES ($1, $2, NOW(), $3)`,
      [client_id, tariff_id, expiry_date]
    )
    
    await pool.query('COMMIT')
    res.json({ success: true, payment_id: payment.rows[0].id })
  } catch (err) {
    await pool.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  }
})

module.exports = router