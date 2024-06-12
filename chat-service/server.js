//chat-service/server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const chatRoutes = require('./routes/chatRoutes');
const { MONGO_URI, PORT } = require('./config');
const Message = require('./models/message');

const app = express();

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/chat', chatRoutes);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Cliente unido a la sala: ${room}`);
  });

  socket.on('chatMessage', async (data) => {
    const { username, message, room, timestamp } = data;
    const newMessage = new Message({ username, message, room, timestamp });
    await newMessage.save();
    io.to(room).emit('chatMessage', data);
    io.to(room).emit('notification', `${username} ha enviado un mensaje`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

server.listen(PORT, () => {
  console.log(`Chat service running on port ${PORT}`);
});
