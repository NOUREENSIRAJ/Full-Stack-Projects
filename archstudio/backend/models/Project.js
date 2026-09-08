const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['residential', 'commercial', 'interior', 'landscape'],
    default: 'residential'
  },
  area: {
    type: String
  },
  images: [{
    url: { type: String, required: true },
    caption: { type: String, default: '' }
  }],
  model3D: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', projectSchema);