const express = require('express');
const { createOrder, verifyPayment, getPayments, razorpayWebhook } = require('../controllers/paymentController');

const router = express.Router();

router.get('/', getPayments);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/webhook', razorpayWebhook);

module.exports = router;
