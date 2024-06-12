// trivia-service/server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { PORT, MONGO_URI } = require('./config');
const triviaRoutes = require('./routes/triviaRoutes');
const { submitAnswer, getRandomQuestions } = require('./controllers/triviaController');

const app = express();

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST']
}));
app.use(bodyParser.json());

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/trivia', triviaRoutes);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST']
  }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', (room) => {
    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = { users: [], questions: [], scores: [] };
    }
    rooms[room].users.push({ id: socket.id, username: socket.handshake.query.username });
    io.to(room).emit('updateUsers', rooms[room].users);
    console.log(`User joined room: ${room}`);
  });

  socket.on('startTrivia', async (room) => {
    try {
      const questions = await getRandomQuestions(10);
      rooms[room].questions = questions;
      io.to(room).emit('startTrivia', questions);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on('submitAnswer', async (data) => {
    await submitAnswer(data, socket, io);
  });

  socket.on('getScores', (room) => {
    if (rooms[room]) {
      io.to(room).emit('updateScores', rooms[room].scores);
    }
  });

  socket.on('disconnect', () => {
    for (const room in rooms) {
      rooms[room].users = rooms[room].users.filter(user => user.id !== socket.id);
      io.to(room).emit('updateUsers', rooms[room].users);
    }
    console.log('Client disconnected');
  });
});

server.listen(PORT || 5000, () => {
  console.log(`Trivia service running on port ${PORT || 5000}`);
});


