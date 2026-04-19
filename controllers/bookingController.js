const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const whatsappService = require('../services/whatsappService');

const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('tripId').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createBooking = async (req, res) => {
    try {
        const { userName, userEmail, userPhone, userAddress, tripId, seats, totalAmount, promoCode, paymentMethod } = req.body;
        
        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).json({ message: 'MISSION FAILURE: Expedition target not found' });
        
        // Anti-Attack Protocols
        const requestedSeats = Number(seats);
        if (isNaN(requestedSeats) || requestedSeats < 1) {
            return res.status(400).json({ message: 'TACTICAL ERROR: Invalid seat allocation requested' });
        }

        if (trip.availableSeats <= 0) {
            return res.status(400).json({ message: 'DEPLOYMENT DENIED: Mission is already SOLD OUT' });
        }
        
        if (trip.availableSeats < requestedSeats) {
            return res.status(400).json({ message: `OPERATIONAL LIMIT: Only ${trip.availableSeats} slots remain for this mission` });
        }

        const newBooking = new Booking({
            userName, userEmail, userPhone, userAddress, tripId, seats, totalAmount, promoCode, paymentMethod
        });

        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { bookingStatus } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.bookingStatus = bookingStatus || booking.bookingStatus;
        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const sendTicket = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('tripId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const userObj = { 
            name: booking.userName, 
            phone: booking.userPhone, 
            email: booking.userEmail 
        };
        
        const result = await whatsappService.sendBookingConfirmation(userObj, booking, booking.tripId || { title: "Custom Mission", duration: "1D" });
        
        if (result.success) {
            res.json({ message: "Ticket sent via WhatsApp successfully" });
        } else {
            res.status(500).json({ message: "Failed to send WhatsApp message", reason: result.reason });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cloudinary = require('cloudinary').v2;

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const sendDigitalTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { base64Image, phoneNumber, message } = req.body;

        if (!base64Image || !phoneNumber) {
            return res.status(400).json({ message: "BAD_REQUEST: Missing image asset or contact identity." });
        }

        console.log(`[Elite Hub] Analyzing deployment for Mission ID: ${id}`);
        console.log(`[Elite Hub] Target Sector: ${phoneNumber}`);

        // 1. Data Sanitization - Ensure Cloudinary receives a valid data URI
        const formattedBase64 = base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`;

        // 2. Upload to Cloudinary Mission Control
        let uploadResult;
        try {
            uploadResult = await cloudinary.uploader.upload(formattedBase64, {
                folder: 'ttdc-elite-tickets',
                public_id: `ticket_dispatch_${id}_${Date.now()}`,
                resource_type: 'image'
            });
            console.log(`[Elite Hub] Cloudinary Asset Online: ${uploadResult.secure_url}`);
        } catch (cloError) {
            console.error("[Elite Hub] Cloudinary FAILURE:", cloError);
            return res.status(500).json({ 
                message: "Cloudinary Gateway Rejection", 
                reason: cloError.message || "Internal assets gateway timed out." 
            });
        }

        // 3. Broadcast via Meta Gateway
        console.log(`[Elite Hub] Commencing Meta Dispatch...`);
        const result = await whatsappService.sendDirectMessage(phoneNumber, message || "Your Expedition Pass is Authorized.", uploadResult.secure_url);

        if (result.success) {
            console.log(`[Elite Hub] Success Code Received. Transmission Complete.`);
            res.json({ 
                message: "HIGH_FIDELITY_DISPATCH_SUCCESS", 
                assetLink: uploadResult.secure_url,
                dispatchId: result.messageId
            });
        } else {
            console.error(`[Elite Hub] Meta Gateway FAILURE: ${result.reason}`);
            res.status(500).json({ 
                message: "Meta Dispatch Rejection", 
                reason: result.reason || "Meta API refused the transmission link." 
            });
        }
    } catch (error) {
        console.error("[Elite Hub] CRITICAL SYSTEM FAULT:", error);
        res.status(500).json({ 
            message: "Operational System Failure", 
            error: error.message 
        });
    }
};

const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json({ message: 'Booking purged successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllBookings, createBooking, updateBookingStatus, sendTicket, sendDigitalTicket, deleteBooking };
