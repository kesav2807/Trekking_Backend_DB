const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Public route to fetch videos
router.get('/', videoController.getAllVideos);

// Protected routes (Add middleware auth if necessary, but skipping for speed unless required)
router.post('/', videoController.createVideo);
router.put('/:id', videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);

module.exports = router;
