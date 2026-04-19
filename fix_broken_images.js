const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Trip = require('./models/Trip');
const Destination = require('./models/Destination');

dotenv.config();

const fixBrokenImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        const brokenUrl = "https://res.cloudinary.com/dybqmcgdz/image/upload/v1711894000/madurai_main.jpg";
        const fallbackUrl = "https://www.sreestours.com/wp-content/uploads/2025/08/Madurai-Meenakshi-Amman-Temple.jpg";

        // Update Trips
        const tripsUpdate = await Trip.updateMany(
            { imageUrl: brokenUrl },
            { $set: { imageUrl: fallbackUrl } }
        );
        console.log(`Updated ${tripsUpdate.modifiedCount} Trips with broken images.`);

        // Update Destinations
        const destsUpdate = await Destination.updateMany(
            { imageUrl: brokenUrl },
            { $set: { imageUrl: fallbackUrl } }
        );
        console.log(`Updated ${destsUpdate.modifiedCount} Destinations with broken images.`);

        console.log("Database Image Verification Complete.");
        process.exit(0);
    } catch (error) {
        console.error("Database Update Failure:", error);
        process.exit(1);
    }
};

fixBrokenImages();
