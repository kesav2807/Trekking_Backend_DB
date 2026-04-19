const express = require('express');
const router = express.Router();
const PromoCode = require('../models/PromoCode');

// Create Promo Code
router.post('/create', async (req, res) => {
    try {
        const promo = await PromoCode.create(req.body);
        res.status(201).json(promo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get All Promo Codes
router.get('/all', async (req, res) => {
    try {
        const promos = await PromoCode.find().sort({ createdAt: -1 });
        res.json(promos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Validate Promo Code (For Public Use)
router.get('/validate/:code', async (req, res) => {
    try {
        const promo = await PromoCode.findOne({ 
            code: req.params.code.toUpperCase(), 
            isActive: true 
        });
        if (promo) {
            if (promo.usedCount >= promo.usageLimit) {
                return res.status(400).json({ message: 'Promo code usage limit has been reached.' });
            }
            res.json(promo);
        } else {
            res.status(404).json({ message: 'Invalid or inactive promo code.' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Promo Code
router.delete('/:id', async (req, res) => {
    try {
        await PromoCode.findByIdAndDelete(req.params.id);
        res.json({ message: 'Promo code deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
