const Destination = require('../models/Destination');
const { cloudinary } = require('../config/cloudinary');

const getAllDestinations = async (req, res) => {
    try {
        const destinations = await Destination.find().sort({ name: 1 });
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateDestination = async (req, res) => {
    try {
        const { name, description, city, region, coordinates } = req.body;
        const destination = await Destination.findById(req.params.id);
        if (!destination) return res.status(404).json({ message: 'Destination not found' });

        destination.name = name || destination.name;
        destination.description = description || destination.description;
        destination.city = city || destination.city;
        destination.region = region || destination.region;
        destination.coordinates = coordinates || destination.coordinates;

        if (req.file) {
            if (destination.public_id) {
                await cloudinary.uploader.destroy(destination.public_id);
            }
            destination.imageUrl = req.file.path;
            destination.public_id = req.file.filename;
        }

        await destination.save();
        res.json(destination);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getAllDestinations, updateDestination };
