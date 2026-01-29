const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });
const connectionString = 'postgresql://neondb_owner:npg_AxZu5OcCXmL7@ep-polished-cake-ahjm2aou-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const client = new Client({ connectionString });

async function getAdmin() {
    try {
        await client.connect();
        // Insert a fallback admin if none exists, to be safe.
        // We need a valid UUID. Let's try to get one first.
        let res = await client.query(`SELECT id, email FROM dashboard_users ORDER BY created_at LIMIT 1`);

        if (res.rows.length === 0) {
            console.log("No admin found, creating one...");
            // Create one with a specific UUID if possible, or let DB generate
            res = await client.query(`
                INSERT INTO dashboard_users (name, email, password_hash, role)
                VALUES ('Super Admin', 'admin@saaspro.com', 'hashed_pw', 'admin')
                RETURNING id, email
            `);
        }

        console.log('VALID_ADMIN_ID:', res.rows[0].id);

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
getAdmin();
