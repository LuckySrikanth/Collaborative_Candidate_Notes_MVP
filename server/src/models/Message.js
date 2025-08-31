const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
