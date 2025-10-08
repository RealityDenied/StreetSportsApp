// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, default: 'Unnamed' },
  email: { type: String, required: true, unique: true },
  password: { type: String },           // hashed later
  roles: { type: [String], default: ['viewer'] }, // e.g. ['player','organizer','viewer']
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
