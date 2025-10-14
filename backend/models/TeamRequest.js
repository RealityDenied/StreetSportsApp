const mongoose = require('mongoose');

const teamRequestSchema = new mongoose.Schema({
  team: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  message: {
    type: String,
    trim: true,
    maxlength: 200
  }
}, { 
  timestamps: true 
});

// Ensure one pending request per user per team
teamRequestSchema.index({ team: 1, receiver: 1, status: 1 }, { 
  unique: true, 
  partialFilterExpression: { status: 'pending' } 
});

module.exports = mongoose.model('TeamRequest', teamRequestSchema);
