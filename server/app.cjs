
const express = require('express');
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

// Export for Vercel (serverless)
module.exports = app;

// Start server only if run directly (local dev)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
