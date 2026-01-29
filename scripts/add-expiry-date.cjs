const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });
const connectionString = 'postgresql://neondb_owner:npg_AxZu5OcCXmL7@ep-polished-cake-ahjm2aou-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const client = new Client({ connectionString });

async function migrate() {
    try {
        await client.connect();
        await client.query(`
            ALTER TABLE promo_codes
            ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP;
        `);
        console.log('Migration successful: expiry_date column added.');
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
migrate();
