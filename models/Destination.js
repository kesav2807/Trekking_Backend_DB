const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: 'Discover the breathtaking beauty and rich heritage of this majestic region.' },
    city: { type: String, default: 'Metropolitan Hub' },
    region: { type: String, default: 'South India Territory' },
    coordinates: { type: String, default: '12.9716° N, 77.5946° E' },
    imageUrl: { type: String, default: 'https://res.cloudinary.com/dybqmcgdz/image/upload/q_auto/f_auto/v1775027933/8a25be66-d849-49e6-8a17-df3f5ba49768.png' },
    public_id: { type: String }, // For Cloudinary
    tripCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
