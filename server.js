// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const { PORT, MONGO_URI, JWT_SECRET } = require('./config');
const authRoutes = require('./routes/authRoutes');
const { authenticate } = require('./controllers/authController');
const jwt = require('jsonwebtoken');

const app = express();

// Configura CORS
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(bodyParser.json());

// Conexión a MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Rutas de autenticación
app.use('/auth', authRoutes);

// Sirve los archivos de React
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Ruta protegida
app.get('/videoconferencia', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Cualquier otra ruta responde con el archivo index.html de React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Crear el servidor HTTP
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST']
  }
});

const rooms = {};  // Almacena los participantes por sala

io.on('connection', socket => {
  console.log('Nuevo cliente conectado');

  socket.on('join', room => {
    const token = socket.handshake.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const username = decodedToken.username;

    socket.username = username; // Almacenar el nombre de usuario en el socket para referencia futura

    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = [];
    }
    rooms[room].push(username);

    io.to(room).emit('updateParticipants', rooms[room]);
    console.log(`Cliente unido a la sala: ${room}`);
  });

  socket.on('leave', room => {
    socket.leave(room);
    if (rooms[room]) {
      rooms[room] = rooms[room].filter(name => name !== socket.username);
      io.to(room).emit('updateParticipants', rooms[room]);
    }
    console.log(`Cliente salió de la sala: ${room}`);
  });

  socket.on('disconnect', () => {
    for (let room in rooms) {
      if (rooms[room]) {
        rooms[room] = rooms[room].filter(name => name !== socket.username);
        io.to(room).emit('updateParticipants', rooms[room]);
      }
    }
    console.log('Cliente desconectado');
  });

  socket.on('signal', data => {
    io.to(data.room).emit('signal', data);
  });

  socket.on('message', data => {
    io.to(data.room).emit('message', data);
  });

  socket.on('muteAudio', data => {
    io.to(data.room).emit('muteAudio', data);
  });

  socket.on('muteVideo', data => {
    io.to(data.room).emit('muteVideo', data);
  });

  socket.on('shareScreen', data => {
    io.to(data.room).emit('shareScreen', data);
  });

  socket.on('recordingStatus', data => {
    io.to(data.room).emit('recordingStatus', data);
  });
});

server.listen(PORT || 3000, () => {
  console.log(`Server running on port ${PORT || 3000}`);
});

