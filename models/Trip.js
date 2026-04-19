const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    category: { type: String, required: true, default: 'Trending' },
    imageUrl: { type: String, required: true },
    videoUrl: { type: String }, // For Cinematic Visual Assets
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    public_id: { type: String }, // For Cloudinary
    public_id_video: { type: String }, // For Cloudinary Video
    tax: { type: Number, default: 0 },
    inclusions: [{ type: String }],
    itinerary: [{
        day: Number,
        title: String,
        details: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
