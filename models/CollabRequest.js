const mongoose = require('mongoose');

const collabRequestSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'denied'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('CollabRequest', collabRequestSchema);