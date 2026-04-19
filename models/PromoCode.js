const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discount: { type: Number, required: true, min: 0, max: 100 },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', promoCodeSchema);
