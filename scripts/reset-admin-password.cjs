
const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function reset() {
    try {
        await client.connect();

        const password = 'password123';
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        console.log(`Resetting admin password to: ${password}`);

        const res = await client.query(
            `UPDATE dashboard_users SET password_hash = $1 WHERE role = 'admin' RETURNING email`,
            [hash]
        );

        if (res.rows.length > 0) {
            console.log(`Password reset for ${res.rows.length} admin(s).`);
            console.log(`Email: ${res.rows[0].email}`);
            console.log(`Password: ${password}`);
        } else {
            console.log('No admin user found to update.');
        }

    } catch (err) {
        console.error('Reset failed:', err);
    } finally {
        await client.end();
    }
}

reset();
