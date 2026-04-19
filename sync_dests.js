require('dotenv').config();
const mongoose = require('mongoose');
const Trip = require('./models/Trip');
const Destination = require('./models/Destination');

const syncAllDestinations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        const trips = await Trip.find();
        const locations = [...new Set(trips.map(t => t.location.split(',')[0].trim()))];

        console.log(`Found ${locations.length} unique regions:`, locations);

        for (const regionName of locations) {
            let dest = await Destination.findOne({ name: regionName });
            
            const count = await Trip.countDocuments({ location: new RegExp('^' + regionName, 'i') });
            
            if (!dest) {
                console.log(`Creating new Destination: ${regionName}`);
                dest = new Destination({ 
                    name: regionName,
                    imageUrl: "https://res.cloudinary.com/dybqmcgdz/image/upload/q_auto/f_auto/v1775027933/8a25be66-d849-49e6-8a17-df3f5ba49768.png",
                    tripCount: count
                });
            } else {
                console.log(`Updating tripCount for: ${regionName}`);
                dest.tripCount = count;
            }
            await dest.save();
        }

        console.log("Global Destination Synchronization Complete.");
        process.exit(0);
    } catch (error) {
        console.error("Sync Failure:", error);
        process.exit(1);
    }
};

syncAllDestinations();
