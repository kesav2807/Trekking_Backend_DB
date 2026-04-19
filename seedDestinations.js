const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Trip = require('./models/Trip');
const Destination = require('./models/Destination');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedDestinations = async () => {
    try {
        const trips = await Trip.find();
        const locs = [...new Set(trips.map(t => t.location.split(',')[0].trim()))];
        
        for (const loc of locs) {
            const existing = await Destination.findOne({ name: loc });
            if (!existing) {
                const count = await Trip.countDocuments({ location: new RegExp('^' + loc, 'i') });
                await new Destination({ name: loc, tripCount: count }).save();
                console.log(`Seeded: ${loc}`);
            }
        }
        console.log('Destination seeding complete');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDestinations();
