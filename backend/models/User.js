
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // only for manual login
  googleId: { type: String, default: null },
  roles: { type: [String], default: ['viewer'] }, // player, organizer, viewer
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
