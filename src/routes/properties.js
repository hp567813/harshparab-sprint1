const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all properties (public)
router.get('/', async (req, res) => {
    try {
        const { status, city, minPrice, maxPrice, propertyType } = req.query;
        
        let query = `
            SELECT p.*, u.first_name, u.last_name, u.email, u.phone 
            FROM properties p 
            JOIN users u ON p.seller_id = u.id 
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }
        if (city) {
            query += ' AND p.city LIKE ?';
            params.push(`%${city}%`);
        }
        if (minPrice) {
            query += ' AND p.price >= ?';
            params.push(minPrice);
        }
        if (maxPrice) {
            query += ' AND p.price <= ?';
            params.push(maxPrice);
        }
        if (propertyType) {
            query += ' AND p.property_type = ?';
            params.push(propertyType);
        }

        query += ' ORDER BY p.created_at DESC';

        const [properties] = await db.execute(query, params);
        res.json(properties);
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get property by ID
router.get('/:id', async (req, res) => {
    try {
        const [properties] = await db.execute(
            'SELECT p.*, u.first_name, u.last_name, u.email, u.phone FROM properties p JOIN users u ON p.seller_id = u.id WHERE p.id = ?',
            [req.params.id]
        );

        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.json(properties[0]);
    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create property (sellers and admins only)
router.post('/', authenticateToken, requireRole(['seller', 'admin']), async (req, res) => {
    try {
        const {
            title, description, price, address, city, state, zipCode,
            bedrooms, bathrooms, squareFeet, propertyType, imageUrl
        } = req.body;

        const sellerId = req.user.role === 'admin' ? req.body.sellerId || req.user.id : req.user.id;

        const [result] = await db.execute(
            `INSERT INTO properties 
            (seller_id, title, description, price, address, city, state, zip_code, 
             bedrooms, bathrooms, square_feet, property_type, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [sellerId, title, description, price, address, city, state, zipCode,
             bedrooms, bathrooms, squareFeet, propertyType, imageUrl]
        );

        res.status(201).json({
            message: 'Property created successfully',
            propertyId: result.insertId
        });
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update property
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const propertyId = req.params.id;
        
        // Check if user owns the property or is admin
        const [properties] = await db.execute('SELECT seller_id FROM properties WHERE id = ?', [propertyId]);
        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        if (req.user.role !== 'admin' && properties[0].seller_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this property' });
        }

        const {
            title, description, price, address, city, state, zipCode,
            bedrooms, bathrooms, squareFeet, propertyType, status, imageUrl
        } = req.body;

        await db.execute(
            `UPDATE properties SET 
            title = ?, description = ?, price = ?, address = ?, city = ?, state = ?, zip_code = ?,
            bedrooms = ?, bathrooms = ?, square_feet = ?, property_type = ?, status = ?, image_url = ?
            WHERE id = ?`,
            [title, description, price, address, city, state, zipCode,
             bedrooms, bathrooms, squareFeet, propertyType, status, imageUrl, propertyId]
        );

        res.json({ message: 'Property updated successfully' });
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete property
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const propertyId = req.params.id;
        
        // Check if user owns the property or is admin
        const [properties] = await db.execute('SELECT seller_id FROM properties WHERE id = ?', [propertyId]);
        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        if (req.user.role !== 'admin' && properties[0].seller_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this property' });
        }

        await db.execute('DELETE FROM properties WHERE id = ?', [propertyId]);
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;