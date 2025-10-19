const express = require('express');
const router = express.Router();
const { generateQuiz, getQuiz } = require('../controllers/quizController.js');
const {authMiddleware}= require('../middlewares/authMiddleware.js');

router.post('/generate',authMiddleware, generateQuiz);
router.get('/getquiz/:id',authMiddleware, getQuiz);

module.exports = router;
