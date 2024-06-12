//chat-service/controllers/chatController.js

const Message = require('../models/message');

// Guardar mensaje
const saveMessage = async (req, res) => {
  const { username, message, room } = req.body;
  try {
    const newMessage = new Message({ username, message, room });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Error guardando el mensaje' });
  }
};

// Obtener mensajes por sala
const getMessages = async (req, res) => {
  const { room } = req.params;
  try {
    const messages = await Message.find({ room });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo los mensajes' });
  }
};

module.exports = { saveMessage, getMessages };
