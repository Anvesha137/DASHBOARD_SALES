
const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_AxZu5OcCXmL7@ep-polished-cake-ahjm2aou-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
