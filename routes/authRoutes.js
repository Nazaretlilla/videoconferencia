//routes/authRoutes.js
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

// Log para la solicitud de registro
router.post('/register', (req, res, next) => {
  console.log('Solicitud de registro recibida:', req.body);
  next();
}, register);

// Log para la solicitud de inicio de sesión
router.post('/login', (req, res, next) => {
  console.log('Solicitud de inicio de sesión recibida:', req.body);
  next();
}, login);

module.exports = router;

