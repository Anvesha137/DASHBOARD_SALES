
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
const PORT = process.env.PORT || 3001;

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

if (fs.existsSync(distPath)) {
    console.log(`Serving static files from: ${distPath}`);
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
} else {
    console.log(`Dist directory not found at: ${distPath}. Run 'npm run build' first.`);
    // Fallback for when running server-only in dev without dist
    if (process.env.NODE_ENV !== 'production') {
        app.get('/', (req, res) => res.send('Backend Server Running. Frontend not built or not served.'));
    }
}

// Start server only if run directly (local dev)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
    });
}
