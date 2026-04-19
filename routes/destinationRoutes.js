const express = require('express');
const { getAllDestinations, updateDestination } = require('../controllers/destinationController');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.get('/', getAllDestinations);
router.put('/:id', upload.single('image'), updateDestination);

module.exports = router;
