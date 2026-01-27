
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const connectionString = 'postgresql://neondb_owner:npg_AxZu5OcCXmL7@ep-polished-cake-ahjm2aou-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({ connectionString });

async function seed() {
    try {
        await client.connect();
        console.log('Connected. Clearing existing data...');

        // Clear tables in correct order
        await client.query('TRUNCATE TABLE expenses, promo_codes, users, sales_people, dashboard_users, audit_logs CASCADE');

        console.log('Tables cleared. Starting seed...');

        // 1. Get or Create Admin ID
        let adminRes = await client.query(`SELECT id FROM dashboard_users WHERE role = 'admin' LIMIT 1`);
        let adminId;

        if (adminRes.rows.length === 0) {
            console.log('No admin found, creating one...');
            // Check if table exists first (in case migration didn't run, though unlikely)
            // Assuming table exists as per user flow.
            const newAdminRes = await client.query(`
                INSERT INTO dashboard_users (name, email, role, password_hash)
                VALUES ('Super Admin', 'admin@saaspro.com', 'admin', '$2b$10$EpI/kZ/W.K/W.K/W.K/W.K') -- Mock hash
                RETURNING id
            `);
            adminId = newAdminRes.rows[0].id;
        } else {
            adminId = adminRes.rows[0].id;
        }

        // 2. Sales People
        console.log('Seeding Sales People...');
        const salesNames = ['Dwight Schrute', 'Jim Halpert', 'Stanley Hudson', 'Phyllis Vance'];
        const salesIds = [];

        for (const name of salesNames) {
            const email = `${name.split(' ')[0].toLowerCase()}@quickrevert.com`;
            // Check if exists
            const existing = await client.query(`SELECT id FROM sales_people WHERE email = $1`, [email]);
            if (existing.rows.length > 0) {
                salesIds.push(existing.rows[0].id);
            } else {
                const res = await client.query(
                    `INSERT INTO sales_people (name, email, active) VALUES ($1, $2, true) RETURNING id`,
                    [name, email]
                );
                salesIds.push(res.rows[0].id);
            }
        }

        // 3. Promo Codes
        console.log('Seeding Promo Codes...');
        const promos = [
            { code: 'SUMMER50', discount: 50, max: 100, status: 'active' },
            { code: 'WELCOME10', discount: 10, max: 500, status: 'active' },
            { code: 'VIP90', discount: 90, max: 5, status: 'disabled' },
            { code: 'EXPIRED20', discount: 20, max: 50, status: 'expired' }
        ];
        const promoIds = [];

        for (let i = 0; i < promos.length; i++) {
            const p = promos[i];
            const salesId = salesIds[i % salesIds.length];

            // Delete if exists to avoid dupes/unique constraints if any
            await client.query(`DELETE FROM promo_codes WHERE code = $1`, [p.code]);

            const res = await client.query(
                `INSERT INTO promo_codes (code, discount_percentage, max_usage, status, assigned_sales_id, created_by, approved_by)
         VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id`,
                [p.code, p.discount, p.max, p.status, salesId, adminId]
            );
            promoIds.push(res.rows[0].id);
        }

        // 4. End Users
        console.log('Seeding Users...');
        // Clear some users first to clean up? Or just add more? Let's add ONLY if low count.
        // Actually for demo purposes, creating fresh ones with unique names is safer.
        const packages = ['free', 'starter', 'pro', 'enterprise'];
        for (let i = 1; i <= 10; i++) {
            const pkg = packages[i % 4];
            const promoId = i % 2 === 0 ? promoIds[i % promoIds.length] : null;
            const salesId = i % 3 === 0 ? salesIds[i % salesIds.length] : null;
            const username = `user_v2_${i}_${Date.now()}`;
            const email = `user_v2_${i}_${Date.now()}@example.com`;

            await client.query(
                `INSERT INTO users (username, email, "package", followers_now, automations_count, promo_code_id, onboarding_sales_id, is_affiliate, joined_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE - (${i} * INTERVAL '1 day'))`,
                [username, email, pkg, Math.floor(Math.random() * 50000), Math.floor(Math.random() * 100), promoId, salesId, i % 5 === 0]
            );

            if (promoId) {
                await client.query(`UPDATE promo_codes SET usage_count = usage_count + 1 WHERE id = $1`, [promoId]);
            }
        }

        // 5. Expenses
        console.log('Seeding Expenses...');
        const expenses = [
            { type: 'travel', merch: 'Uber', amt: 45.50, status: 'approved' },
            { type: 'tools', merch: 'Figma', amt: 15.00, status: 'reimbursed' },
            { type: 'marketing', merch: 'Google Ads', amt: 500.00, status: 'awaiting_approval' },
            { type: 'misc', merch: 'Team Lunch', amt: 120.00, status: 'awaiting_approval' }
        ];

        for (const ex of expenses) {
            await client.query(
                `INSERT INTO expenses (type, merchant, expense_date, amount, description, status, created_by, approved_by)
             VALUES ($1, $2, CURRENT_DATE, $3, 'Seeded expense', $4, $5, $6)`,
                [ex.type, ex.merch, ex.amt, ex.status, adminId, ex.status === 'awaiting_approval' ? null : adminId]
            );
        }

        console.log('Seed completed successfully!');

    } catch (err) {
        console.error('Seed failed:', err);
    } finally {
        await client.end();
    }
}

seed();
