const Trip = require('../models/Trip');
const Destination = require('../models/Destination');
const { cloudinary } = require('../config/cloudinary');

const syncDestination = async (location) => {
    const regionName = location.split(',')[0].trim();
    const existing = await Destination.findOne({ name: regionName });
    if (!existing) {
        await new Destination({ name: regionName }).save();
    }
    // Update count
    const count = await Trip.countDocuments({ location: new RegExp('^' + regionName, 'i') });
    await Destination.findOneAndUpdate({ name: regionName }, { tripCount: count });
};

const getAllTrips = async (req, res) => {
    try {
        const trips = await Trip.find().sort({ createdAt: -1 });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTrip = async (req, res) => {
    try {
        const { title, description, location, duration, price, availableSeats, startDate, endDate, category, tax, inclusions, itinerary, mediaType } = req.body;
        
        let imageUrl = '';
        let public_id = '';
        let videoUrl = '';
        let public_id_video = '';

        if (req.files) {
            if (req.files.image) {
                imageUrl = req.files.image[0].path;
                public_id = req.files.image[0].filename;
            }
            if (req.files.video) {
                videoUrl = req.files.video[0].path;
                public_id_video = req.files.video[0].filename;
            }
        } else if (req.file) {
            // Fallback for single file upload
            imageUrl = req.file.path;
            public_id = req.file.filename;
        }

        const newTrip = new Trip({
            title, description, location, duration, price: Number(price), availableSeats: Number(availableSeats), 
            startDate, endDate, category: category || 'Trending', tax: Number(tax || 0),
            inclusions: inclusions ? (typeof inclusions === 'string' ? inclusions.split(',').map(s => s.trim()) : inclusions) : [],
            itinerary: itinerary ? (typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary) : [],
            mediaType: mediaType || 'image',
            imageUrl, public_id, videoUrl, public_id_video
        });

        await newTrip.save();
        await syncDestination(location);
        res.status(201).json(newTrip);
    } catch (error) {
        console.error("Create Trip Error:", error);
        res.status(400).json({ message: error.message });
    }
};

const updateTrip = async (req, res) => {
    try {
        const { title, description, location, duration, price, availableSeats, startDate, endDate, category, tax, inclusions, itinerary, mediaType } = req.body;
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        trip.title = title || trip.title;
        trip.description = description || trip.description;
        trip.location = location || trip.location;
        trip.duration = duration || trip.duration;
        trip.price = price ? Number(price) : trip.price;
        trip.availableSeats = availableSeats ? Number(availableSeats) : trip.availableSeats;
        trip.startDate = startDate || trip.startDate;
        trip.endDate = endDate || trip.endDate;
        trip.category = category || trip.category;
        trip.tax = tax ? Number(tax) : trip.tax;
        trip.mediaType = mediaType || trip.mediaType;

        if (inclusions) {
            trip.inclusions = typeof inclusions === 'string' ? inclusions.split(',').map(s => s.trim()) : inclusions;
        }

        if (itinerary) {
            trip.itinerary = typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary;
        }

        if (req.files) {
            if (req.files.image) {
                if (trip.public_id) await cloudinary.uploader.destroy(trip.public_id);
                trip.imageUrl = req.files.image[0].path;
                trip.public_id = req.files.image[0].filename;
            }
            if (req.files.video) {
                if (trip.public_id_video) await cloudinary.uploader.destroy(trip.public_id_video, { resource_type: 'video' });
                trip.videoUrl = req.files.video[0].path;
                trip.public_id_video = req.files.video[0].filename;
            }
        } else if (req.file) {
            if (trip.public_id) await cloudinary.uploader.destroy(trip.public_id);
            trip.imageUrl = req.file.path;
            trip.public_id = req.file.filename;
        }

        await trip.save();
        if (location) await syncDestination(location);
        res.json(trip);
    } catch (error) {
        console.error("Update Trip Error:", error);
        res.status(400).json({ message: error.message });
    }
};

const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        if (trip.public_id) await cloudinary.uploader.destroy(trip.public_id);
        if (trip.public_id_video) await cloudinary.uploader.destroy(trip.public_id_video, { resource_type: 'video' });

        await Trip.findByIdAndDelete(req.params.id);
        res.json({ message: 'Trip deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllTrips, getTripById, createTrip, updateTrip, deleteTrip };
