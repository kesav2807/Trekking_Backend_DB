const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  youtubeId: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'MISSION_ARCHIVE'
  },
  missionType: {
    type: String,
    enum: ['PRIMARY_MISSION', 'INTEL_RECON', 'TRAIL_DOCUMENTARY', 'EQUIPMENT_TEST'],
    default: 'PRIMARY_MISSION'
  },
  stats: {
    altitude: String,
    temperature: String,
    windSpeed: String
  },
  coordinates: {
    lat: String,
    lng: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['OPERATIONAL', 'ARCHIVED', 'CLASSIFIED'],
    default: 'OPERATIONAL'
  }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
