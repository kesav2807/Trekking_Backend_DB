const mongoose = require('mongoose');
const Trip = require('./models/Trip');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const dummyTrips = [
    {
        title: "Kodaikanal Peak Expedition",
        description: "Scale the highest peaks of Kodaikanal. Experience the breathtaking Pillar Rocks and Guna Caves. Visit hidden waterfalls and enjoy a bonfire night at our elite adventure stay.",
        price: 2499,
        location: "Kodaikanal, Tamil Nadu",
        category: "Mountains",
        duration: "2 Days / 1 Night",
        availableSeats: 10,
        startDate: "2026-04-10",
        endDate: "2026-04-12",
        imageUrl: "https://images.unsplash.com/photo-1590496794008-383c8070bb25?auto=format&fit=crop&q=80&w=1200"
    },
    {
        title: "Megamalai Cloud Forest Jeep Safari",
        description: "Explore the Mist-covered Highwavys of Megamalai. Includes an exclusive Jeep Safari through tea estates and dense forests. Discover hidden waterfalls and witness the majestic elephants in their natural habitat.",
        price: 3800,
        location: "Megamalai, Tamil Nadu",
        category: "Adventure",
        duration: "2 Days / 1 Night",
        availableSeats: 10,
        startDate: "2026-04-15",
        endDate: "2026-04-17",
        imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1200"
    },
    {
        title: "Kothagiri Tea Trail Trek",
        description: "Walk through the historic tea gardens of Kothagiri. Visit the breathtaking Catherine Falls and Rangaswamy Peak. Includes high-fidelity adventure stays and exploration of secret tribal paths.",
        price: 3200,
        location: "Kothagiri, Nilgiris",
        category: "Mountains",
        duration: "3 Days / 2 Nights",
        availableSeats: 10,
        startDate: "2026-04-20",
        endDate: "2026-04-23",
        imageUrl: "https://images.unsplash.com/photo-1582234373447-068393e87600?auto=format&fit=crop&q=80&w=1200"
    },
    {
        title: "Valparai Wildlife & Shola Walk",
        description: "Engage in a premier wildlife safari in Valparai. Spot leopards, hornbills, and the rare Nilgiri Tahr. Experience an adventure stay amidst tea gardens and visit hidden jungle waterfalls.",
        price: 4500,
        location: "Valparai, Kerala Border",
        category: "Adventure",
        duration: "2 Days / 1 Night",
        availableSeats: 10,
        startDate: "2026-04-25",
        endDate: "2026-04-27",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200"
    },
    {
        title: "Gavi Deep Jungle Expedition",
        description: "Venturing into the core of Gavi. Includes a professional Jeep Safari, boating in Gavi lake, and an exclusive jungle adventure stay. Explore hidden waterfalls and prime wildlife corridors.",
        price: 5500,
        location: "Gavi, Pathanamthitta",
        category: "Adventure",
        duration: "3 Days / 2 Nights",
        availableSeats: 10,
        startDate: "2026-05-01",
        endDate: "2026-05-04",
        imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200"
    },
    {
        title: "Kodaikanal Waterfall Chase",
        description: "A specialized trek focusing on the hidden waterfalls of Kodaikanal. Discover secret pools and enjoy a refreshing crystal-clear adventure stay experience.",
        price: 1800,
        location: "Kodaikanal, Tamil Nadu",
        category: "Beach", 
        duration: "1 Day / 1 Night",
        availableSeats: 10,
        startDate: "2026-05-05",
        endDate: "2026-05-06",
        imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200"
    },
    {
        title: "Megamalai Night Forest Safari",
        description: "Experience the thrill of Megamalai after dark. A guided professional Jeep Safari to spot nocturnal wildlife and hidden vistas under the moonlight.",
        price: 4200,
        location: "Megamalai, Tamil Nadu",
        category: "Adventure",
        duration: "2 Days / 1 Night",
        availableSeats: 10,
        startDate: "2026-05-10",
        endDate: "2026-05-12",
        imageUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80&w=1200"
    },
    {
        title: "Kothagiri Summit Challenge",
        description: "The ultimate Kothagiri expedition. Conquer Rangaswamy Pillar and Catherine Falls. Premium adventure stay with panoramic Nilgiri views.",
        price: 6500,
        location: "Kothagiri, Nilgiris",
        category: "Mountains",
        duration: "4 Days / 3 Nights",
        availableSeats: 10,
        startDate: "2026-05-15",
        endDate: "2026-05-19",
        imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1200"
    },
    {
        title: "Valparai Nirar Dam Trek",
        description: "A trek through the dense forests of Valparai to the Nirar Dam area. Visit secret waterfalls and stay in eco-friendly adventure cabins.",
        price: 3200,
        location: "Valparai, Kerala Border",
        category: "Adventure",
        duration: "2 Days / 1 Night",
        availableSeats: 10,
        startDate: "2026-05-20",
        endDate: "2026-05-22",
        imageUrl: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80&w=1200"
    },
    {
        title: "Gavi Riverside Adventure",
        description: "A serene but adventurous stay by the Gavi river. Includes short jungle walks and exploration of nearby hidden waterfalls and rare bird nesting sites.",
        price: 4800,
        location: "Gavi, Pathanamthitta",
        category: "Adventure",
        duration: "2 Days / 1 Night",
        availableSeats: 10,
        startDate: "2026-05-25",
        endDate: "2026-05-27",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200"
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Hub connected to Database...');
        
        await Trip.deleteMany({}); // Clear existing to prevent duplicates
        console.log('Wiping existing archives...');

        await Trip.insertMany(dummyTrips);
        console.log('10 High-Fidelity Trekking Expeditions Injected Successfully!');
        
        mongoose.connection.close();
        console.log('Database operation finalized.');
    } catch (err) {
        console.error('Seeding Engine Failure:', err);
        process.exit(1);
    }
};

seedDB();
