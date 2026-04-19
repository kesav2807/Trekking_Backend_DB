require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const tripRoutes = require('./routes/tripRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const promoRoutes = require('./routes/promoRoutes');
const videoRoutes = require('./routes/videoRoutes');

const app = express();

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to Database Wrapper for Serverless
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/trips', tripRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/videos', videoRoutes);

app.get('/', (req, res) => {
    res.render('index', { 
        title: 'TTDC Expedition API', 
        message: 'TTDC API is running...',
        status: 'Online'
    });
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== '1') {
  // --- PRODUCTION SESSION INITIALIZATION ---
  connectDB();
  app.listen(PORT, () => {
      console.log(`[TTDC HUB] Operational on Port ${PORT}`);
  });
}

// Export the Express API
module.exports = app;
