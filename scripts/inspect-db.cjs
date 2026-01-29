const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_AxZu5OcCXmL7@ep-polished-cake-ahjm2aou-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const client = new Client({ connectionString });

async function inspect() {
    try {
        await client.connect();

        const res = await client.query(`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);

        console.table(res.rows);

        // If there is an enum 'package' or 'package_type', let's check its values
        const enumRes = await client.query(`
            SELECT t.typname, e.enumlabel
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid
            WHERE t.typname = 'package' OR t.typname = 'package_name';
        `);
        console.table(enumRes.rows);

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
inspect();
