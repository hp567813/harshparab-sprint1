const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all sales (admin only) or user's sales
router.get('/', authenticateToken, async (req, res) => {
    try {
        let query = `
            SELECT s.*, 
                   p.title as property_title, p.address, p.city, p.state,
                   b.first_name as buyer_first_name, b.last_name as buyer_last_name, b.email as buyer_email,
                   sel.first_name as seller_first_name, sel.last_name as seller_last_name, sel.email as seller_email
            FROM sales s
            JOIN properties p ON s.property_id = p.id
            JOIN users b ON s.buyer_id = b.id
            JOIN users sel ON s.seller_id = sel.id
        `;
        let params = [];

        if (req.user.role === 'admin') {
            query += ' ORDER BY s.created_at DESC';
        } else if (req.user.role === 'seller') {
            query += ' WHERE s.seller_id = ? ORDER BY s.created_at DESC';
            params.push(req.user.id);
        } else {
            query += ' WHERE s.buyer_id = ? ORDER BY s.created_at DESC';
            params.push(req.user.id);
        }

        const [sales] = await db.execute(query, params);
        res.json(sales);
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create sale
router.post('/', authenticateToken, requireRole(['buyer', 'admin']), async (req, res) => {
    try {
        const { propertyId, sellerId, salePrice, commission, saleDate, notes } = req.body;
        const buyerId = req.user.role === 'admin' ? req.body.buyerId || req.user.id : req.user.id;

        // Check if property exists and is available
        const [properties] = await db.execute('SELECT * FROM properties WHERE id = ? AND status = "available"', [propertyId]);
        if (properties.length === 0) {
            return res.status(400).json({ error: 'Property not available for sale' });
        }

        const [result] = await db.execute(
            'INSERT INTO sales (property_id, buyer_id, seller_id, sale_price, commission, sale_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [propertyId, buyerId, sellerId, salePrice, commission || 0, saleDate, notes]
        );

        // Update property status to pending
        await db.execute('UPDATE properties SET status = "pending" WHERE id = ?', [propertyId]);

        res.status(201).json({
            message: 'Sale created successfully',
            saleId: result.insertId
        });
    } catch (error) {
        console.error('Create sale error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update sale status
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const saleId = req.params.id;
        const { status, notes } = req.body;

        // Check if user is involved in the sale or is admin
        const [sales] = await db.execute('SELECT * FROM sales WHERE id = ?', [saleId]);
        if (sales.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        const sale = sales[0];
        if (req.user.role !== 'admin' && sale.buyer_id !== req.user.id && sale.seller_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this sale' });
        }

        await db.execute('UPDATE sales SET status = ?, notes = ? WHERE id = ?', [status, notes, saleId]);

        // Update property status based on sale status
        if (status === 'completed') {
            await db.execute('UPDATE properties SET status = "sold" WHERE id = ?', [sale.property_id]);
        } else if (status === 'cancelled') {
            await db.execute('UPDATE properties SET status = "available" WHERE id = ?', [sale.property_id]);
        }

        res.json({ message: 'Sale updated successfully' });
    } catch (error) {
        console.error('Update sale error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get sale statistics (admin only)
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const [totalSales] = await db.execute('SELECT COUNT(*) as count, SUM(sale_price) as total_value FROM sales WHERE status = "completed"');
        const [pendingSales] = await db.execute('SELECT COUNT(*) as count FROM sales WHERE status = "pending"');
        const [monthlySales] = await db.execute(`
            SELECT MONTH(sale_date) as month, COUNT(*) as count, SUM(sale_price) as total_value 
            FROM sales WHERE status = "completed" AND YEAR(sale_date) = YEAR(CURDATE()) 
            GROUP BY MONTH(sale_date) ORDER BY month
        `);

        res.json({
            totalSales: totalSales[0].count,
            totalValue: totalSales[0].total_value || 0,
            pendingSales: pendingSales[0].count,
            monthlySales
        });
    } catch (error) {
        console.error('Get sales stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;