
const db = require('../server/db.cjs');

async function seed() {
    console.log('Seeding mock data for Notifications & Expenses...');

    try {
        // Get a user ID to assign expenses to (using the first available user)
        const { rows: users } = await db.query('SELECT id FROM dashboard_users LIMIT 1');
        const userId = users[0]?.id;

        if (!userId) {
            console.error('No users found! Please run the main seed script first.');
            process.exit(1);
        }

        // 1. Critical Expiry (Expires in 2 days)
        await db.query(`
            INSERT INTO expenses (merchant, type, amount, description, expense_date, created_by, status, product_link, invoice_url, expiry_date)
            VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '28 days', $5, 'approved', $6, $7, CURRENT_DATE + INTERVAL '2 days')
        `, ['AWS Cloud', 'tools', 1200.50, 'Monthly Server Costs', userId, 'https://aws.amazon.com', 'https://s3.amazonaws.com/invoice_dummy.pdf']);

        // 2. Warning Expiry (Expires in 8 days)
        await db.query(`
            INSERT INTO expenses (merchant, type, amount, description, expense_date, created_by, status, product_link, invoice_url, expiry_date)
            VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '350 days', $5, 'reimbursed', $6, $7, CURRENT_DATE + INTERVAL '8 days')
        `, ['JetBrains', 'tools', 299.00, 'IDE Subscription Yearly', userId, 'https://jetbrains.com', '']);

        // 3. Normal Expense with Links
        await db.query(`
            INSERT INTO expenses (merchant, type, amount, description, expense_date, created_by, status, product_link, invoice_url, expiry_date)
            VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '1 day', $5, 'awaiting_approval', $6, $7, NULL)
        `, ['Uber Business', 'travel', 45.20, 'Client Meeting Transport', userId, '', 'https://uber.com/receipts/123']);

        console.log('✅ Mock data seeded! Refresh your dashboard.');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        // We can't easily close the pool from here if it's exported directly, 
        // but for a one-off script allowing the process to exit naturally or force exit is fine.
        process.exit(0);
    }
}

seed();
