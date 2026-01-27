
const router = require('express').Router();
const db = require('../db.cjs');
const { authenticateToken, requireRole } = require('../middleware/auth.cjs');

// GET all users (with filters)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search, package: pkg, affiliate, promo } = req.query;
        let query = `
      SELECT u.*, 
             pc.code as promo_code_name,
             sp.name as sales_person_name
      FROM users u
      LEFT JOIN promo_codes pc ON u.promo_code_id = pc.id
      LEFT JOIN sales_people sp ON u.onboarding_sales_id = sp.id
      WHERE u.deleted_at IS NULL
    `;
        const params = [];
        let idx = 1;

        if (search) {
            query += ` AND (u.username ILIKE $${idx} OR u.email ILIKE $${idx})`;
            params.push(`%${search}%`);
            idx++;
        }
        if (pkg && pkg !== 'All') {
            query += ` AND u.package = $${idx}`;
            params.push(pkg);
            idx++;
        }
        if (affiliate && affiliate !== 'All') {
            query += ` AND u.is_affiliate = $${idx}`;
            params.push(affiliate === 'Yes');
            idx++;
        }

        query += ` ORDER BY u.joined_date DESC LIMIT 100`;

        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// CREATE User
router.post('/', authenticateToken, async (req, res) => {
    // TODO: Add validation
    const { username, email, package: pkg, followers_joined, followers_now, is_affiliate } = req.body;

    try {
        const { rows } = await db.query(
            `INSERT INTO users (username, email, package, followers_joined, followers_now, is_affiliate)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [username, email, pkg || 'free', followers_joined || 0, followers_now || 0, is_affiliate || false]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

module.exports = router;
