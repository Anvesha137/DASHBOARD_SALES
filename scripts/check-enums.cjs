const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_AxZu5OcCXmL7@ep-polished-cake-ahjm2aou-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const client = new Client({ connectionString });

async function checkEnums() {
    try {
        await client.connect();

        const res = await client.query(`
            SELECT t.typname, e.enumlabel
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid
            ORDER BY t.typname, e.enumlabel;
        `);

        console.log(JSON.stringify(res.rows, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
checkEnums();
