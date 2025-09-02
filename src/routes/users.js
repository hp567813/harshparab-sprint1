const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, email, first_name, last_name, phone, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user statistics (admin only)
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users');
        const [usersByRole] = await db.execute('SELECT role, COUNT(*) as count FROM users GROUP BY role');
        const [recentUsers] = await db.execute('SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');

        res.json({
            totalUsers: totalUsers[0].count,
            usersByRole,
            recentUsers: recentUsers[0].count
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user role (admin only)
router.put('/:id/role', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        if (!['buyer', 'seller', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;