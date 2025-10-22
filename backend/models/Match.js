const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  teams: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team'
  }],
  won: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team',
    default: null 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed'], 
    default: 'pending' 
  },
  matchDate: {
    type: Date,
    default: Date.now
  },
  score: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  highlights: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Highlight'
  }]
}, { 
  timestamps: true 
});

// Validate teams array
matchSchema.pre('save', function(next) {
  if (this.teams.length !== 2) {
    return next(new Error('Match must have exactly 2 teams'));
  }
  if (this.teams[0].toString() === this.teams[1].toString()) {
    return next(new Error('Teams must be different'));
  }
  next();
});

module.exports = mongoose.model('Match', matchSchema);