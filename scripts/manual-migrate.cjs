
const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_AxZu5OcCXmL7@ep-polished-cake-ahjm2aou-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({
  connectionString,
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to Neon DB');

    console.log('Dropping old tables to ensure clean slate...');
    await client.query(`DROP TABLE IF EXISTS audit_logs;`);
    await client.query(`DROP TABLE IF EXISTS expenses;`);
    await client.query(`DROP TABLE IF EXISTS users;`);
    await client.query(`DROP TABLE IF EXISTS promo_codes;`);
    await client.query(`DROP TABLE IF EXISTS sales_people;`);
    await client.query(`DROP TABLE IF EXISTS dashboard_users;`);

    // We can also drop types just in case, though usually optional if cascading
    await client.query(`DROP TYPE IF EXISTS role_type CASCADE;`);
    await client.query(`DROP TYPE IF EXISTS expense_status_type CASCADE;`);
    await client.query(`DROP TYPE IF EXISTS expense_type CASCADE;`);
    await client.query(`DROP TYPE IF EXISTS promo_status_type CASCADE;`);
    await client.query(`DROP TYPE IF EXISTS user_package_type CASCADE;`);

    console.log('Running DDL...');

    // 1. Extensions
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. Enums
    const enums = [
      "CREATE TYPE user_package_type AS ENUM ('free', 'starter', 'pro', 'enterprise');",
      "CREATE TYPE promo_status_type AS ENUM ('active', 'expired', 'disabled');",
      "CREATE TYPE expense_type AS ENUM ('travel', 'tools', 'marketing', 'misc');",
      "CREATE TYPE expense_status_type AS ENUM ('awaiting_approval', 'approved', 'reimbursed');",
      "CREATE TYPE role_type AS ENUM ('admin', 'sales');"
    ];

    for (const enumSql of enums) {
      try {
        await client.query(enumSql);
      } catch (e) {
        if (e.code === '42710') { // duplicate_object
          console.log('Enum already exists, skipping:', enumSql.split(' ')[2]);
        } else {
          throw e;
        }
      }
    }

    // 3. Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS dashboard_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role role_type NOT NULL DEFAULT 'sales',
        name TEXT NOT NULL,
        refresh_token_hash TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sales_people (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        active BOOLEAN DEFAULT TRUE,
        joined_on DATE DEFAULT CURRENT_DATE,
        deleted_at TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code TEXT NOT NULL UNIQUE,
        discount_percentage INTEGER NOT NULL,
        usage_count INTEGER DEFAULT 0,
        max_usage INTEGER NOT NULL,
        status promo_status_type NOT NULL DEFAULT 'active',
        assigned_sales_id UUID REFERENCES sales_people(id) ON DELETE SET NULL,
        created_by UUID REFERENCES dashboard_users(id) ON DELETE SET NULL,
        approved_by UUID REFERENCES dashboard_users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        package user_package_type NOT NULL DEFAULT 'free',
        followers_joined INTEGER DEFAULT 0,
        followers_now INTEGER DEFAULT 0,
        automations_count INTEGER DEFAULT 0,
        promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
        is_affiliate BOOLEAN DEFAULT FALSE,
        joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        onboarding_sales_id UUID REFERENCES sales_people(id) ON DELETE SET NULL,
        deleted_at TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type expense_type NOT NULL,
        merchant TEXT NOT NULL,
        expense_date DATE NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        description TEXT,
        status expense_status_type NOT NULL DEFAULT 'awaiting_approval',
        created_by UUID REFERENCES dashboard_users(id) ON DELETE SET NULL,
        approved_by UUID REFERENCES dashboard_users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        table_name TEXT NOT NULL,
        record_id UUID NOT NULL,
        action TEXT NOT NULL,
        performed_by UUID REFERENCES dashboard_users(id) ON DELETE SET NULL,
        diff JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_promo_code_id ON users(promo_code_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);`);

    console.log('Migration completed successfully!');

  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    await client.end();
  }
}

runMigration();
