const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  generatedBy: { type: String, enum: ['AI','instructor'], default: 'AI' },
  questions: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

const quizModel = mongoose.model('Quiz', quizSchema);
module.exports={quizModel}
