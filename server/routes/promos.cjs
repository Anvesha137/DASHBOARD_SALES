
const router = require('express').Router();
const db = require('../db.cjs');
const { authenticateToken, requireRole } = require('../middleware/auth.cjs');

// GET all promo codes
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { rows } = await db.query(`
      SELECT pc.*, 
             sp.name as assigned_sales_name, 
             creator.name as created_by_name, 
             approver.name as approved_by_name
      FROM promo_codes pc
      LEFT JOIN sales_people sp ON pc.assigned_sales_id = sp.id
      LEFT JOIN dashboard_users creator ON pc.created_by = creator.id
      LEFT JOIN dashboard_users approver ON pc.approved_by = approver.id
      WHERE pc.deleted_at IS NULL
      ORDER BY pc.created_at DESC
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// CREATE Promo
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
    const { code, discount, max_usage, assigned_sales_id } = req.body;
    try {
        const { rows } = await db.query(
            `INSERT INTO promo_codes (code, discount_percentage, max_usage, assigned_sales_id, created_by, approved_by)
       VALUES ($1, $2, $3, $4, $5, $5) RETURNING *`,
            [code.toUpperCase(), discount, max_usage, assigned_sales_id || null, req.user.id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create promo' });
    }
});

module.exports = router;
