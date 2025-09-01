const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const salesRoutes = require('./routes/sales');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const db = require('./config/database');
        
        // Get total counts
        const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users');
        const [totalProperties] = await db.execute('SELECT COUNT(*) as count FROM properties');
        const [totalSales] = await db.execute('SELECT COUNT(*) as count FROM sales WHERE status = "completed"');
        const [totalRevenue] = await db.execute('SELECT SUM(sale_price) as total FROM sales WHERE status = "completed"');
        
        // Get properties by status
        const [propertiesByStatus] = await db.execute('SELECT status, COUNT(*) as count FROM properties GROUP BY status');
        
        // Get recent activities
        const [recentProperties] = await db.execute('SELECT title, created_at FROM properties ORDER BY created_at DESC LIMIT 5');
        const [recentSales] = await db.execute(`
            SELECT s.sale_price, s.sale_date, p.title 
            FROM sales s 
            JOIN properties p ON s.property_id = p.id 
            WHERE s.status = "completed" 
            ORDER BY s.sale_date DESC LIMIT 5
        `);

        res.json({
            totalUsers: totalUsers[0].count,
            totalProperties: totalProperties[0].count,
            totalSales: totalSales[0].count,
            totalRevenue: totalRevenue[0].total || 0,
            propertiesByStatus,
            recentProperties,
            recentSales
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Catch all handler for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Handle port conflicts gracefully
const server = app.listen(PORT, (err) => {
    if (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
    console.log(`EstateEdge server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});