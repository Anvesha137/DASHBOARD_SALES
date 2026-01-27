
const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_AxZu5OcCXmL7@ep-polished-cake-ahjm2aou-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({
    connectionString,
});

async function setupDatabase() {
    try {
        await client.connect();
        console.log('Connected to Neon DB');

        console.log('Creating "users" table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        follower_count INTEGER DEFAULT 0,
        followers_at_join INTEGER DEFAULT 0,
        package_name TEXT NOT NULL,
        promo_code_used TEXT,
        automations_used INTEGER DEFAULT 0,
        email_integrated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        time_spent_minutes INTEGER DEFAULT 0,
        is_affiliate BOOLEAN DEFAULT FALSE,
        referral_count INTEGER DEFAULT 0
      );
    `);

        console.log('Creating "promo_codes" table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        discount_type TEXT NOT NULL,
        value NUMERIC NOT NULL,
        expiry_date TEXT NOT NULL, 
        assigned_user_id TEXT,
        usage_count INTEGER DEFAULT 0,
        max_uses INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT,
        approved_by TEXT
      );
    `);

        console.log('Tables created successfully!');

    } catch (err) {
        console.error('Error setting up database:', err);
    } finally {
        await client.end();
    }
}

setupDatabase();
