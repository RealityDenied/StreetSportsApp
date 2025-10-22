const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: { 
    type: String, 
    required: true,
    trim: true 
  },
  sportType: { 
    type: String, 
    required: true,
    enum: ['Cricket', 'Football', 'Basketball', 'Tennis', 'Volleyball', 'Badminton', 'Table Tennis', 'Other']
  },
  organiser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  startDate: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  poster: { 
    public_id: { type: String },
    url: { type: String }
  },
  teams: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team' 
  }],
  matches: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Match' 
  }],
  eventLink: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  audienceFree: {
    type: Boolean,
    default: true
  },
  playerFree: {
    type: Boolean,
    default: true
  },
  audienceFee: {
    type: Number,
    default: 0,
    min: 0
  },
  playerFee: {
    type: Number,
    default: 0,
    min: 0
  },
  audience: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Audience'
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { 
  timestamps: true 
});

// Generate event link before saving
eventSchema.pre('save', function(next) {
  if (!this.eventLink) {
    const eventName = this.eventName.replace(/\s+/g, '');
    const eventId = this._id.toString().slice(-6);
    this.eventLink = `${eventName}${eventId}`;
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);