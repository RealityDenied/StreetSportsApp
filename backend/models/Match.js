const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  teams: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team',
    validate: {
      validator: function(teams) {
        return teams.length === 2;
      },
      message: 'Match must have exactly 2 teams'
    }
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
    team1: { type: Number, default: 0 },
    team2: { type: Number, default: 0 }
  }
}, { 
  timestamps: true 
});

// Ensure teams are different
matchSchema.pre('save', function(next) {
  if (this.teams.length === 2 && this.teams[0].toString() === this.teams[1].toString()) {
    return next(new Error('Teams must be different'));
  }
  next();
});

module.exports = mongoose.model('Match', matchSchema);