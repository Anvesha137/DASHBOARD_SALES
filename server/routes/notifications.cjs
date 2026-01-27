
const router = require('express').Router();
const db = require('../db.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

router.get('/', authenticateToken, async (req, res) => {
    try {
        // Query for expenses expiring in the next 10 days
        // CAST to date to handle potential timestamps effectively
        const { rows } = await db.query(`
            SELECT *, 
            expiry_date::date - CURRENT_DATE as days_left
            FROM expenses 
            WHERE 
                deleted_at IS NULL 
                AND expiry_date IS NOT NULL
                AND expiry_date >= CURRENT_DATE
                AND expiry_date <= CURRENT_DATE + INTERVAL '10 days'
            ORDER BY expiry_date ASC
        `);

        // Map to a generic notification structure
        const notifications = rows.map(expense => ({
            id: `exp-${expense.id}`,
            title: 'Expense Expiry Warning',
            message: `Subscription for ${expense.merchant} expires in ${expense.days_left} day(s).`,
            type: 'expiry',
            severity: expense.days_left <= 3 ? 'critical' : 'warning',
            date: expense.expiry_date,
            daysLeft: expense.days_left,
            raw: expense
        }));

        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
