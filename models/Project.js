const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['ongoing', 'finished'], required: true },
  summary: { type: String, required: true },
  scriptPath: { type: String, default: '' },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);