const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const PromoCode = require('../models/PromoCode');
const whatsappService = require('../services/whatsappService');

const createOrder = async (req, res) => {
    try {
        const { amount, bookingId } = req.body;
        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: 'INR',
            receipt: `receipt_${bookingId}`,
        };

        const order = await razorpay.orders.create(options);
        res.status(201).json(order);
    } catch (error) {
        console.error("RAZORPAY ORDER FAILURE DETAILS:", JSON.stringify(error));
        res.status(500).json({ 
            message: error.description || error.message || "Razorpay API configuration failed",
            error: error
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'O2vW8B4ksmPqubFN3SmelqGd')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const booking = await Booking.findById(bookingId);
            if (!booking) return res.status(404).json({ message: "Booking not found" });

            const trip = await Trip.findById(booking.tripId);
            if (trip) {
                trip.availableSeats -= booking.seats;
                await trip.save();
            }

            booking.paymentStatus = 'Completed';
            booking.bookingStatus = 'Confirmed';
            booking.paymentId = razorpay_payment_id;
            booking.orderId = razorpay_order_id;
            await booking.save();

            const payment = new Payment({
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                amount: booking.totalAmount * 100,
                bookingId: booking._id
            });
            await payment.save();

            // High-Fidelity Promo Usage Increment
            if (booking.promoCode) {
                await PromoCode.findOneAndUpdate(
                    { code: booking.promoCode.toUpperCase() },
                    { $inc: { usedCount: 1 } }
                );
            }

            // Optional Enhancement: Trigger Automated WhatsApp Notifications Async
            try {
                const userObj = { name: booking.userName, phone: booking.userPhone, email: booking.userEmail };
                whatsappService.sendBookingConfirmation(userObj, booking, trip || { title: "Custom Mission", duration: "1D" });
                whatsappService.sendAdminAlert(userObj, booking, trip || { title: "Custom Mission" });
            } catch (err) {
                console.error("[Notification System] Failed async push:", err);
            }

            res.status(200).json({ message: "Payment verified successfully", bookingId: booking._id });
        } else {
            res.status(400).json({ message: "Invalid signature" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('bookingId').sort({ createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const razorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET; // Ensure you configure a Razorpay Webhook Secret
        const signature = req.headers['x-razorpay-signature'];
        
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (expectedSignature === signature) {
            console.log("[Webhook System] Validated Webhook Signature.");
            
            if (req.body.event === 'payment.captured' || req.body.event === 'order.paid') {
                const paymentEntity = req.body.payload.payment.entity;
                const orderId = paymentEntity.order_id;
                
                const booking = await Booking.findOne({ orderId: orderId });
                if (!booking) {
                    console.log("[Webhook System] No booking matching this order found yet.");
                    return res.status(200).send("No matching booking via Order ID");
                }

                // If already processed via verifyPayment, skip
                if (booking.paymentStatus === 'Completed') {
                    console.log("[Webhook System] Booking already secured. Skipping duplicate notification.");
                    return res.status(200).send("Already Processed");
                }

                const trip = await Trip.findById(booking.tripId);
                if (trip) {
                    trip.availableSeats -= booking.seats;
                    await trip.save();
                }
                
                booking.paymentStatus = 'Completed';
                booking.bookingStatus = 'Confirmed';
                booking.paymentId = paymentEntity.id;
                await booking.save();
                
                // Create backup payment log
                const payment = new Payment({
                    orderId: orderId,
                    paymentId: paymentEntity.id,
                    signature: "WEBHOOK_CAPTURED",
                    amount: paymentEntity.amount,
                    bookingId: booking._id
                });
                await payment.save();

                // Trigger Automation Webhook System
                try {
                    const userObj = { name: booking.userName, phone: booking.userPhone, email: booking.userEmail };
                    whatsappService.sendBookingConfirmation(userObj, booking, trip || { title: "Custom Mission", duration: "1D" });
                    whatsappService.sendAdminAlert(userObj, booking, trip || { title: "Custom Mission" });
                } catch (err) {
                    console.error("[Webhook Notification System] Failed async push:", err);
                }

                return res.status(200).send("Webhook Processed Successfully");
            }

            // Acknowledge other events without processing
            res.status(200).send("Event Not Supported");
        } else {
            console.warn("[Webhook System] INVALID SIGNATURE DETECTED.");
            res.status(400).send("Invalid Webhook Signature");
        }
    } catch (error) {
        console.error("[Webhook System] Critical Failure:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = { createOrder, verifyPayment, getPayments, razorpayWebhook };
