
const router = require('express').Router();
const db = require('../db.cjs');
const { authenticateToken, requireRole } = require('../middleware/auth.cjs');

// GET Sales People with Performance Stats
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { rows } = await db.query(`
      SELECT sp.*, 
             COUNT(u.id) as onboarded_count
      FROM sales_people sp
      LEFT JOIN users u ON sp.id = u.onboarding_sales_id AND u.deleted_at IS NULL
      WHERE sp.deleted_at IS NULL
      GROUP BY sp.id
      ORDER BY sp.name ASC
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// CREATE Sales Person (Admin Only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
    const { name, email } = req.body;
    try {
        const { rows } = await db.query(
            `INSERT INTO sales_people (name, email) VALUES ($1, $2) RETURNING *`,
            [name, email]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add sales person' });
    }
});

// DELETE (Soft)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        await db.query(`UPDATE sales_people SET deleted_at = NOW() WHERE id = $1`, [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete' });
    }
});

module.exports = router;
