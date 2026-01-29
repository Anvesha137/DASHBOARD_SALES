
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth.cjs');
const userRoutes = require('./routes/users.cjs');
const salesRoutes = require('./routes/sales.cjs');
const promoRoutes = require('./routes/promos.cjs');
const expenseRoutes = require('./routes/expenses.cjs');
const analyticsRoutes = require('./routes/analytics.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors()); // Allow all for dev, tighten for prod
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', require('./routes/notifications.cjs'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const fs = require('fs');

// Serve static files (Production / Deployment)
const distPath = path.join(__dirname, '../dist');
const indexHtmlPath = path.join(distPath, 'index.html');

console.log(`[Server] Checking dist path: ${distPath}`);
if (fs.existsSync(distPath)) {
    console.log(`[Server] Serving static files from: ${distPath}`);
    app.use(express.static(distPath));

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        if (fs.existsSync(indexHtmlPath)) {
            res.sendFile(indexHtmlPath);
        } else {
            console.error(`Index.html not found at: ${indexHtmlPath}`);
            res.status(404).send('Application built, but index.html not found.');
        }
    });
});
} else {
    console.error(`[Server] Dist directory NOT found at: ${distPath}`);
    console.error(`[Server] Current directory: ${__dirname}`);
    console.error(`[Server] Directory contents of ..:`, fs.readdirSync(path.join(__dirname, '..')));

    // Fallback for when running server-only in dev without dist
    app.get('*', (req, res) => {
        res.status(404).send(`
            <h1>Backend Server Running</h1>
            <p>Frontend production build not found.</p>
            <p>Expected path: ${distPath}</p>
            <p>Please run <code>npm run build</code> before starting the server in production mode.</p>
        `);
    });
}

// Start server only if run directly (local dev)
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`[Server] Server starting on port ${PORT}`);
        console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
        console.log(`[Server] Accessible at http://0.0.0.0:${PORT}`);
    });
}
