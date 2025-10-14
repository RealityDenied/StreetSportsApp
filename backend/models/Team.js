const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: { 
    type: String, 
    required: true,
    trim: true 
  },
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  users: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  matchesPlayed: { 
    type: Number, 
    default: 0 
  },
  matchesWon: { 
    type: Number, 
    default: 0 
  },
  matchesResultPending: { 
    type: Number, 
    default: 0 
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Ensure team name is unique within an event
teamSchema.index({ event: 1, teamName: 1 }, { unique: true });

module.exports = mongoose.model('Team', teamSchema);