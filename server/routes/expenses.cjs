
const router = require('express').Router();
const db = require('../db.cjs');
const { authenticateToken, requireRole } = require('../middleware/auth.cjs');

// GET Expenses
router.get('/', authenticateToken, async (req, res) => {
    const { status } = req.query;
    try {
        let query = `
            SELECT 
                e.*,
                u1.name as raised_by_name,
                u2.name as approved_by_name
            FROM expenses e
            LEFT JOIN dashboard_users u1 ON e.created_by = u1.id
            LEFT JOIN dashboard_users u2 ON e.approved_by = u2.id
            WHERE e.deleted_at IS NULL
        `;
        const params = [];
        if (status && status !== 'All') {
            query += ` AND e.status = $1`;
            params.push(status);
        }
        query += ` ORDER BY e.created_at DESC`;
        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// CREATE Expense
router.post('/', authenticateToken, async (req, res) => {
    const { merchant, type, amount, description, expense_date, product_link, invoice_url, expiry_date } = req.body;

    if (!merchant || !amount || !expense_date || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const { rows } = await db.query(
            `INSERT INTO expenses (
                merchant, type, amount, description, expense_date, 
                created_by, product_link, invoice_url, expiry_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                merchant, type, amount, description, expense_date,
                req.user.id, product_link, invoice_url, expiry_date
            ]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

// APPROVE / REIMBURSE (Admin only)
router.put('/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
    const { status } = req.body; // 'approved' or 'reimbursed'
    try {
        const { rows } = await db.query(
            `UPDATE expenses SET status = $1, approved_by = $2 WHERE id = $3 RETURNING *`,
            [status, req.user.id, req.params.id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
