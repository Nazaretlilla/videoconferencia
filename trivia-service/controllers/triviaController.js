//trivia-service/controllers/triviaController.js

const { Trivia, Score } = require('../models/trivia');

const submitAnswer = async (data, socket, io) => {
  const { room, userId, username, questionIndex, answer, timeTaken } = data;
  const roomData = rooms[room];
  const question = roomData.questions[questionIndex];
  const isCorrect = question.correctAnswer === answer;
  const points = isCorrect ? 10 - timeTaken : 0;

  roomData.scores.push({
    username,
    points,
    isCorrect,
    answer
  });

  io.to(room).emit('receiveAnswer', {
    username,
    answer,
    isCorrect,
    points
  });

  if (questionIndex === roomData.questions.length - 1) {
    io.to(room).emit('updateScores', roomData.scores);
  }
};

//ESTA FALLANDO Y NO SE PORQUE
const getRandomQuestions = async (limit = 10) => {
  const count = await Trivia.countDocuments();
  const random = Math.floor(Math.random() * count);
  return Trivia.find().skip(random).limit(limit);
};

const startTrivia = async (req, res) => {
  try {
    const questions = await getRandomQuestions(10);
    res.json(questions);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const getScores = async (req, res) => {
  try {
    const room = req.query.room;
    if (rooms[room]) {
      res.json(rooms[room].scores);
    } else {
      res.status(404).send('Room not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = { submitAnswer, startTrivia, getScores, getRandomQuestions };



