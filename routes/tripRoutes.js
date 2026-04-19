const express = require('express');
const { getAllTrips, getTripById, createTrip, updateTrip, deleteTrip } = require('../controllers/tripController');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.get('/', getAllTrips);
router.get('/:id', getTripById);
router.post('/', upload.single('image'), createTrip);
router.put('/:id', upload.single('image'), updateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;
