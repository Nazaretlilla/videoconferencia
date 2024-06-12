//trivia-service/models/trivia.js

const mongoose = require('mongoose');

const triviaSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String,
});

const scoreSchema = new mongoose.Schema({
  username: String,
  points: Number,
});

const Trivia = mongoose.model('Trivia', triviaSchema);
const Score = mongoose.model('Score', scoreSchema);

module.exports = { Trivia, Score };
