
const router = require('express').Router();
const db = require('../db.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const [usersRes, automationsRes, affiliateRes, salesRes, packagesRes] = await Promise.all([
            db.query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL'),
            db.query('SELECT SUM(automations_count) as total FROM users WHERE deleted_at IS NULL'),
            db.query('SELECT COUNT(*) as count FROM users WHERE is_affiliate = true AND deleted_at IS NULL'),
            db.query(`
        SELECT sp.name, COUNT(u.id) as count 
        FROM sales_people sp
        JOIN users u ON sp.id = u.onboarding_sales_id
        WHERE sp.deleted_at IS NULL AND u.deleted_at IS NULL
        GROUP BY sp.name ORDER BY count DESC LIMIT 5
      `),
            db.query(`SELECT package, COUNT(*) as count FROM users WHERE deleted_at IS NULL GROUP BY package`)
        ]);

        res.json({
            totalUsers: parseInt(usersRes.rows[0].count),
            totalAutomations: parseInt(automationsRes.rows[0].total) || 0,
            affiliateCount: parseInt(affiliateRes.rows[0].count),
            topSales: salesRes.rows,
            packageData: packagesRes.rows.map(r => ({ name: r.package, value: parseInt(r.count) }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
