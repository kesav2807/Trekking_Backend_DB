const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    paymentId: { type: String, required: true },
    signature: { type: String, required: true },
    amount: { type: Number, required: true }, // in paise
    status: { type: String, enum: ['Paid', 'Failed'], default: 'Paid' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
