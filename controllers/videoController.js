const Video = require('../models/Video');

// Get all videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new video
exports.createVideo = async (req, res) => {
  const video = new Video(req.body);
  try {
    const newVideo = await video.save();
    res.status(201).json(newVideo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a video
exports.updateVideo = async (req, res) => {
  try {
    const updatedVideo = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedVideo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a video
exports.deleteVideo = async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
