// routes/webhooks.js
const express = require('express')
const router = express.Router()
const pool = require('../config/db')

router.post('/cloudpayments', async (req, res) => {
  const { InvoiceId, Status, Amount, PaymentId } = req.body
  
  try {
    if (Status === 'Completed') {
      await pool.query(
        `UPDATE payments 
         SET payment_status = 'completed', updated_at = NOW()
         WHERE payment_id = $1`,
        [PaymentId]
      )
      
      // Здесь можно добавить логику активации доступа
    } else if (Status === 'Failed') {
      await pool.query(
        `UPDATE payments 
         SET payment_status = 'failed', updated_at = NOW()
         WHERE payment_id = $1`,
        [PaymentId]
      )
    }
    
    res.status(200).send('OK')
  } catch (err) {
    console.error('Webhook error:', err)
    res.status(500).send('Error')
  }
})

module.exports = router