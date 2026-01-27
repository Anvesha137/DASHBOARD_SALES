
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function migrate() {
    try {
        await client.connect();
        console.log('Running manual migration for expenses table...');

        // Add columns if they don't exist
        await client.query(`
            DO $$
            BEGIN
                BEGIN
                    ALTER TABLE expenses ADD COLUMN product_link TEXT;
                EXCEPTION
                    WHEN duplicate_column THEN RAISE NOTICE 'column product_link already exists in expenses.';
                END;

                BEGIN
                    ALTER TABLE expenses ADD COLUMN invoice_url TEXT;
                EXCEPTION
                    WHEN duplicate_column THEN RAISE NOTICE 'column invoice_url already exists in expenses.';
                END;

                BEGIN
                    ALTER TABLE expenses ADD COLUMN expiry_date DATE;
                EXCEPTION
                    WHEN duplicate_column THEN RAISE NOTICE 'column expiry_date already exists in expenses.';
                END;
            END;
            $$
        `);

        console.log('Columns added successfully.');
    } catch (err) {
        console.error('Manual migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
