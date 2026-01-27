/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    // 1. Extensions
    pgm.createExtension('uuid-ossp', { ifNotExists: true });

    // 2. Enums (Native Postgres Types)
    pgm.createType('user_package_type', ['free', 'starter', 'pro', 'enterprise']);
    pgm.createType('promo_status_type', ['active', 'expired', 'disabled']);
    pgm.createType('expense_type', ['travel', 'tools', 'marketing', 'misc']);
    pgm.createType('expense_status_type', ['awaiting_approval', 'approved', 'reimbursed']);
    pgm.createType('role_type', ['admin', 'sales']);

    // 3. dashboard_users (Auth)
    pgm.createTable('dashboard_users', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
        email: { type: 'text', notNull: true, unique: true },
        password_hash: { type: 'text', notNull: true },
        role: { type: 'role_type', notNull: true, default: 'sales' },
        name: { type: 'text', notNull: true },
        refresh_token_hash: { type: 'text' },
        is_active: { type: 'boolean', default: true },
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
        deleted_at: { type: 'timestamp' }
    });

    // 4. sales_people
    pgm.createTable('sales_people', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
        name: { type: 'text', notNull: true },
        email: { type: 'text', notNull: true, unique: true },
        active: { type: 'boolean', default: true },
        joined_on: { type: 'date', default: pgm.func('current_date') },
        deleted_at: { type: 'timestamp' }
    });

    // 5. promo_codes
    pgm.createTable('promo_codes', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
        code: { type: 'text', notNull: true, unique: true },
        discount_percentage: { type: 'integer', notNull: true },
        usage_count: { type: 'integer', default: 0 },
        max_usage: { type: 'integer', notNull: true },
        status: { type: 'promo_status_type', notNull: true, default: 'active' },
        assigned_sales_id: { type: 'uuid', references: 'sales_people(id)', onDelete: 'SET NULL' },
        created_by: { type: 'uuid', references: 'dashboard_users(id)', onDelete: 'SET NULL' },
        approved_by: { type: 'uuid', references: 'dashboard_users(id)', onDelete: 'SET NULL' },
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
        deleted_at: { type: 'timestamp' }
    });

    // 6. users (SaaS End Users)
    pgm.createTable('users', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
        username: { type: 'text', notNull: true },
        email: { type: 'text', notNull: true },
        package: { type: 'user_package_type', notNull: true, default: 'free' },
        followers_joined: { type: 'integer', default: 0 },
        followers_now: { type: 'integer', default: 0 },
        automations_count: { type: 'integer', default: 0 },
        promo_code_id: { type: 'uuid', references: 'promo_codes(id)', onDelete: 'SET NULL' },
        is_affiliate: { type: 'boolean', default: false },
        joined_date: { type: 'timestamp', default: pgm.func('current_timestamp') },
        onboarding_sales_id: { type: 'uuid', references: 'sales_people(id)', onDelete: 'SET NULL' },
        deleted_at: { type: 'timestamp' }
    });

    // 7. expenses
    pgm.createTable('expenses', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
        type: { type: 'expense_type', notNull: true },
        merchant: { type: 'text', notNull: true },
        expense_date: { type: 'date', notNull: true },
        amount: { type: 'numeric(10, 2)', notNull: true },
        description: { type: 'text' },
        status: { type: 'expense_status_type', notNull: true, default: 'awaiting_approval' },
        created_by: { type: 'uuid', references: 'dashboard_users(id)', onDelete: 'SET NULL' },
        approved_by: { type: 'uuid', references: 'dashboard_users(id)', onDelete: 'SET NULL' },
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
        deleted_at: { type: 'timestamp' }
    });

    // 8. audit_logs (Granular History)
    pgm.createTable('audit_logs', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
        table_name: { type: 'text', notNull: true },
        record_id: { type: 'uuid', notNull: true },
        action: { type: 'text', notNull: true }, // 'CREATE', 'UPDATE', 'DELETE'
        performed_by: { type: 'uuid', references: 'dashboard_users(id)', onDelete: 'SET NULL' },
        diff: { type: 'jsonb' }, // { "field": { "old": "X", "new": "Y" } }
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
    });

    // Indexes
    pgm.createIndex('users', 'email');
    pgm.createIndex('users', 'promo_code_id');
    pgm.createIndex('promo_codes', 'code');
    pgm.createIndex('expenses', 'status');
    pgm.createIndex('audit_logs', 'record_id');
    pgm.createIndex('audit_logs', 'table_name');
};

exports.down = pgm => {
    pgm.dropTable('audit_logs');
    pgm.dropTable('expenses');
    pgm.dropTable('users');
    pgm.dropTable('promo_codes');
    pgm.dropTable('sales_people');
    pgm.dropTable('dashboard_users');

    pgm.dropType('role_type');
    pgm.dropType('expense_status_type');
    pgm.dropType('expense_type');
    pgm.dropType('promo_status_type');
    pgm.dropType('user_package_type');

    pgm.dropExtension('uuid-ossp');
};
