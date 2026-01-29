const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });
const connectionString = 'postgresql://neondb_owner:npg_AxZu5OcCXmL7@ep-polished-cake-ahjm2aou-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const client = new Client({ connectionString });

async function inspectPromos() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'promo_codes';
        `);
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
inspectPromos();
