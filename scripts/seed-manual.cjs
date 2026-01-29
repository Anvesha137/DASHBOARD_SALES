const { Client } = require('pg');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

// Hardcode connection string if dotenv fails or just for this script
const connectionString = 'postgresql://neondb_owner:npg_AxZu5OcCXmL7@ep-polished-cake-ahjm2aou-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({ connectionString });

async function seedManual() {
    try {
        await client.connect();
        console.log('Connected to DB.');

        // 1. Users
        console.log('Adding 3 Users...');
        const users = [
            { username: 'RealUser1', email: 'real1@test.com', pkg: 'pro', join: 500, now: 1200, affiliate: true },
            { username: 'RealUser2', email: 'real2@test.com', pkg: 'starter', join: 100, now: 150, affiliate: false },
            { username: 'RealUser3', email: 'real3@test.com', pkg: 'enterprise', join: 5000, now: 8000, affiliate: true }
        ];

        for (const u of users) {
            try {
                await client.query(
                    `INSERT INTO users (username, email, package, followers_joined, followers_now, is_affiliate)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [u.username, u.email, u.pkg, u.join, u.now, u.affiliate]
                );
                console.log(`Added User: ${u.username}`);
            } catch (e) {
                console.error(`Failed to add user ${u.username}:`, e.message);
            }
        }

        // 2. Sales People
        console.log('Adding 3 Sales People...');
        const sales = [
            { name: 'Real Sales 1', email: 'sales1@quickrevert.com', active: true },
            { name: 'Real Sales 2', email: 'sales2@quickrevert.com', active: true },
            { name: 'Real Sales 3', email: 'sales3@quickrevert.com', active: false }
        ];

        let salesIds = [];
        for (const s of sales) {
            const res = await client.query(
                `INSERT INTO sales_people (name, email, active)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (email) DO NOTHING
                 RETURNING id`,
                [s.name, s.email, s.active]
            );
            if (res.rows[0]) salesIds.push(res.rows[0].id);
        }

        // 3. Promo Codes
        if (salesIds.length > 0) {
            console.log('Adding 3 Promo Codes...');
            // Need a creator ID? Let's assume passed or nullable or find admin
            const adminRes = await client.query("SELECT id FROM dashboard_users LIMIT 1");
            const adminId = adminRes.rows[0]?.id;

            const promos = [
                { code: 'REAL10', discount: 10, max: 100 },
                { code: 'REAL50', discount: 50, max: 20 },
                { code: 'REALFLAT', discount: 5, max: 200 } // flat? DB schema might assume percentage if not specified or separate col
            ];
            // DB schema check: promo_codes usually has discount_percentage.

            for (const p of promos) {
                await client.query(
                    `INSERT INTO promo_codes (code, discount_percentage, max_usage, assigned_sales_id, created_by, approved_by)
                     VALUES ($1, $2, $3, $4, $5, $5)
                     ON CONFLICT (code) DO NOTHING`,
                    [p.code, p.discount, p.max, salesIds[0], adminId]
                );
                console.log(`Added Promo: ${p.code}`);
            }
        }

        // 4. Expenses
        console.log('Adding 3 Expenses...');
        const expenses = [
            { type: 'marketing', merch: 'FB Ads', amount: 120.50 },
            { type: 'tools', merch: 'Notion', amount: 15.00 },
            { type: 'misc', merch: 'Coffee', amount: 25.00 }
        ];

        for (const e of expenses) {
            await client.query(
                `INSERT INTO expenses (type, merchant, expense_date, amount, description, status)
                 VALUES ($1, $2, CURRENT_DATE, $3, 'Manual Seed', 'awaiting_approval')`,
                [e.type, e.merch, e.amount]
            );
            console.log(`Added Expense: ${e.merch}`);
        }

        console.log('Manual seed completed.');

    } catch (err) {
        console.error('Script failed:', err);
    } finally {
        await client.end();
    }
}

seedManual();
