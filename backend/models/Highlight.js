const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  match: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Match', 
    required: true 
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  mediaType: {
    type: String,
    enum: ['photo', 'video'],
    required: true
  },
  media: {
    public_id: { type: String },
    url: { type: String }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Highlight', highlightSchema);
