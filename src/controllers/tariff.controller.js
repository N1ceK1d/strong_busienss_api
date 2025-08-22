const pool = require('../config/db');

exports.getAccessTypes = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, description 
            FROM AccessTypes
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTariffs = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.id, a.name AS access_type, t.title, t.description, t.price, t.duration_days
            FROM Tariffs t
            JOIN AccessTypes a ON t.access_type_id = a.id
            WHERE t.is_active = TRUE
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getClientTariffs = async (req, res) => {
    const clientId = req.user.id;
    
    try {
        const result = await pool.query(`
            SELECT t.title, ct.purchase_date, ct.expiry_date, a.name AS access_type
            FROM ClientTariffs ct
            JOIN Tariffs t ON ct.tariff_id = t.id
            JOIN AccessTypes a ON t.access_type_id = a.id
            WHERE ct.client_id = $1 AND ct.is_active = TRUE
        `, [clientId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTariffTests = async (req, res) => {
    const { tariffId } = req.params;
    
    try {
        const result = await pool.query(`
            SELECT tt.test_id, t.name, t.description
            FROM TariffTests tt
            JOIN Tests t ON tt.test_id = t.id
            WHERE tt.tariff_id = $1
        `, [tariffId]);
        
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.purchaseTariffs = async (req, res) => {
    const clientId = req.user.id;
    const { tariffs, total } = req.body;
    const client = await pool.query('SELECT company_id FROM Clients WHERE id = $1', [clientId]);
    const companyId = client.rows[0]?.company_id;

    if (!companyId) {
        return res.status(400).json({ error: 'Компания не найдена' });
    }

    try {
        await pool.query('BEGIN');
        
        // Проверяем, не куплены ли уже эти тарифы
        for (const item of tariffs) {
            const existingTariff = await pool.query(`
                SELECT id FROM ClientTariffs 
                WHERE client_id = $1 AND tariff_id = $2 AND is_active = TRUE
            `, [clientId, item.tariff_id]);
            
            if (existingTariff.rows.length > 0) {
                await pool.query('ROLLBACK');
                return res.status(400).json({ 
                    error: `Тариф уже приобретен (ID: ${item.tariff_id})` 
                });
            }
        }
        
        // Создаем платеж
        const payment = await pool.query(`
            INSERT INTO Payments (client_id, amount, status)
            VALUES ($1, $2, 'completed')
            RETURNING id
        `, [clientId, total]);
        
        const paymentId = payment.rows[0].id;
        
        // Обрабатываем каждый выбранный тариф
        for (const item of tariffs) {
            // Получаем данные тарифа
            const tariffData = await pool.query(`
                SELECT price, duration_days 
                FROM Tariffs 
                WHERE id = $1
            `, [item.tariff_id]);
            
            if (tariffData.rows.length === 0) {
                throw new Error(`Тариф ${item.tariff_id} не найден`);
            }
            
            const duration = tariffData.rows[0].duration_days;
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + duration);
            
            // Создаем запись о покупке
            await pool.query(`
                INSERT INTO ClientTariffs (
                    client_id, 
                    tariff_id, 
                    purchase_date, 
                    expiry_date
                )
                VALUES ($1, $2, NOW(), $3)
            `, [clientId, item.tariff_id, expiryDate]);
            
            // Активируем доступ к тестам
            const tests = await pool.query(`
                SELECT test_id 
                FROM TariffTests 
                WHERE tariff_id = $1
            `, [item.tariff_id]);
            
            for (const test of tests.rows) {
                await pool.query(`
                    INSERT INTO ClientTestsAccess (
                        client_id,
                        test_id,
                        company_id,
                        access_from,
                        access_to
                    )
                    VALUES ($1, $2, $3, NOW(), $4)
                    ON CONFLICT (client_id, test_id) 
                    DO UPDATE SET access_to = EXCLUDED.access_to
                `, [clientId, test.test_id, companyId, expiryDate]);
            }
        }
        
        await pool.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Purchase error:', err);
        res.status(500).json({ 
            error: err.message || 'Internal server error' 
        });
    }
};