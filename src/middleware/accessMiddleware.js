const pool = require('../config/db');

module.exports = async (req, res, next) => {
    // Пропускаем публичные маршруты
    if (req.path.startsWith('/auth') || req.path.startsWith('/tariffs')) {
        return next();
    }

    const clientId = req.user.id;
    const testId = req.params.test_id || req.body.test_id;

    try {
        // Проверяем доступ к тесту
        if (testId) {
            const access = await pool.query(`
                SELECT 1
                FROM ClientTestsAccess
                WHERE client_id = $1
                AND test_id = $2
                AND access_to > NOW()
            `, [clientId, testId]);

            if (access.rows.length === 0) {
                return res.status(403).json({ error: 'Доступ к тесту запрещен' });
            }
        }

        // Проверяем общий доступ к системе
        const activeTariff = await pool.query(`
            SELECT 1
            FROM ClientTariffs
            WHERE client_id = $1
            AND expiry_date > NOW()
            AND is_active = TRUE
            LIMIT 1
        `, [clientId]);

        if (activeTariff.rows.length === 0) {
            return res.status(403).json({ error: 'Необходимо приобрести тариф' });
        }

        next();
    } catch (err) {
        res.status(500).json({ error: 'Ошибка проверки доступа' });
    }
};