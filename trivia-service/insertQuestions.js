const mongoose = require('mongoose');
const fs = require('fs');
const { Trivia } = require('./models/trivia');
const { MONGO_URI } = require('./config');

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    const questions = JSON.parse(fs.readFileSync('questions.json', 'utf-8'));
    return Trivia.insertMany(questions);
  })
  .then(() => {
    console.log('Questions inserted successfully');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error inserting questions:', err);
  });


  // node insertQuestions.js  para insertar preguntas