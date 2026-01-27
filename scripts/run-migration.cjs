
require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL is missing from .env');
    process.exit(1);
}

const binPath = path.resolve('node_modules', '.bin', 'node-pg-migrate');

// Adjust command for Windows if needed (add .cmd)
const bin = process.platform === 'win32' ? `${binPath}.cmd` : binPath;

console.log('Running migrations via binary:', bin);

try {
    // Pass env vars explicitly + current process env. Quote the binary path!
    execSync(`"${bin}" up`, {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: databaseUrl }
    });
    console.log('Migrations complete!');
} catch (err) {
    console.error('Migration failed');
    process.exit(1);
}
