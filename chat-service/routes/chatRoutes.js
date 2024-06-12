//chat-service/routes/chatRoutes.js

const express = require('express');
const { saveMessage, getMessages } = require('../controllers/chatController');
const router = express.Router();

router.post('/messages', saveMessage);
router.get('/messages/:room', getMessages);

module.exports = router;
