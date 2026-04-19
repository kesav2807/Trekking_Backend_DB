const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log("Using cached DB Connection");
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Fails fast instead of hanging Vercel
        });
        isConnected = !!conn.connections[0].readyState;
        console.log(`MongoDB Connected (Serverless): ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
    }
};

module.exports = connectDB;
