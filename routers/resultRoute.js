const express = require('express');
const router = express.Router();
const { submitResult, getResultsForUser } = require('../controllers/resultController.js');
const {authMiddleware} = require('../middlewares/authMiddleware.js');

router.post('/submit', authMiddleware, submitResult);
router.get('/getresults', authMiddleware, getResultsForUser);

module.exports = router;
