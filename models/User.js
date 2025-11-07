const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  artistType: { type: String, required: true },
  bio: { type: String, default: '' },
  contactInfo: { type: String, default: '' },
  profilePic: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);