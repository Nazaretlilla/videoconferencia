const express = require('express');
const { startTrivia, getScores } = require('../controllers/triviaController');

const router = express.Router();

router.get('/start', startTrivia);
router.get('/scores', getScores);

module.exports = router;
