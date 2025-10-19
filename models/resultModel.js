const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: Number,
  responses: { type: Array, default: [] },
  submittedAt: { type: Date, default: Date.now }
});

const resultModel = mongoose.model('Result', resultSchema);
module.exports={resultModel}