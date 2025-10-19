const {resultModel}= require('../models/resultModel.js');

const submitResult = async (req, res) => {
  const { quizId, responses, score } = req.body;
  const result = new resultModel({
    quiz: quizId,
    user: req.user._id,
    responses,
    score
  });
  await result.save();
  // optionally emit via socket.io - will be handled in server socket logic
  res.status(201).json(result);
};

const getResultsForUser = async (req, res) => {
  const results = await resultModel.find({ user: req.user._id }).populate('quiz');
  res.json(results);
};

module.exports = { submitResult, getResultsForUser };
