
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const connectionString = 'postgresql://neondb_owner:npg_AxZu5OcCXmL7@ep-polished-cake-ahjm2aou-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({ connectionString });

async function seedAdmin() {
    try {
        await client.connect();
        console.log('Connected.');

        const email = 'admin@quickrevert.com';
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);

        const res = await client.query(
            `INSERT INTO dashboard_users (email, password_hash, role, name) 
       VALUES ($1, $2, 'admin', 'Super Admin') 
       ON CONFLICT (email) DO NOTHING RETURNING id;`,
            [email, hash]
        );

        if (res.rowCount > 0) {
            console.log('Admin user seeded. ID:', res.rows[0].id);
        } else {
            console.log('Admin user already exists.');
        }

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.end();
    }
}

seedAdmin();
