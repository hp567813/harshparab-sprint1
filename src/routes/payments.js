const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get payments for a sale
router.get('/sale/:saleId', authenticateToken, async (req, res) => {
    try {
        const saleId = req.params.saleId;

        // Check if user is involved in the sale or is admin
        const [sales] = await db.execute('SELECT * FROM sales WHERE id = ?', [saleId]);
        if (sales.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        const sale = sales[0];
        if (req.user.role !== 'admin' && sale.buyer_id !== req.user.id && sale.seller_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to view these payments' });
        }

        const [payments] = await db.execute('SELECT * FROM payments WHERE sale_id = ? ORDER BY payment_date DESC', [saleId]);
        res.json(payments);
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create payment
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { saleId, amount, paymentType, paymentMethod, paymentDate, transactionId, notes } = req.body;

        // Check if user is involved in the sale or is admin
        const [sales] = await db.execute('SELECT * FROM sales WHERE id = ?', [saleId]);
        if (sales.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        const sale = sales[0];
        if (req.user.role !== 'admin' && sale.buyer_id !== req.user.id && sale.seller_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to create payment for this sale' });
        }

        const [result] = await db.execute(
            'INSERT INTO payments (sale_id, amount, payment_type, payment_method, payment_date, transaction_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [saleId, amount, paymentType, paymentMethod, paymentDate, transactionId, notes]
        );

        res.status(201).json({
            message: 'Payment created successfully',
            paymentId: result.insertId
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update payment status
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const paymentId = req.params.id;
        const { status, notes } = req.body;

        // Check if user is admin (only admins can update payment status)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can update payment status' });
        }

        await db.execute('UPDATE payments SET status = ?, notes = ? WHERE id = ?', [status, notes, paymentId]);
        res.json({ message: 'Payment updated successfully' });
    } catch (error) {
        console.error('Update payment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all payments (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const [payments] = await db.execute(`
            SELECT p.*, s.sale_price, pr.title as property_title, pr.address,
                   b.first_name as buyer_first_name, b.last_name as buyer_last_name
            FROM payments p
            JOIN sales s ON p.sale_id = s.id
            JOIN properties pr ON s.property_id = pr.id
            JOIN users b ON s.buyer_id = b.id
            ORDER BY p.payment_date DESC
        `);
        res.json(payments);
    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;