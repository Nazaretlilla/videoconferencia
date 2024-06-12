//controllers/authController.js

// Logica de Autentificación

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET } = require('../config');

// Registro de Usuario
const register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('El nombre de usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('Usuario registrado');
  } catch (err) {
    res.status(500).send('Error en el registro del usuario');
  }
};

// Inicio de Sesión
const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('Usuario o contraseña incorrectos');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Usuario o contraseña incorrectos');
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username }, // Incluye el username en el token
      JWT_SECRET,
      { expiresIn: '1h' } // Expira en 1h   //Pendiente de Implementar metodo de refresco.
    );
    res.json({ token });
  } catch (err) {
    res.status(500).send('Error en el inicio de sesión');
  }
};


// Middleware de Autenticación
const authenticate = (req, res, next) => {
  let token;
  console.log('Headers:', req.headers);
  console.log('Query Token:', req.query.token);

  // Verificar el token en el encabezado de autorización
  const authHeader = req.headers.authorization;
  console.log('Auth Header:', authHeader);
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    // Verificar el token en los parámetros de la URL
    token = req.query.token;
  }
  // Log de depuración para diferenciar tipos de solicitudes
  if (token) {
    if (authHeader) {
      console.log('Solicitud AJAX/WebSocket con token en el encabezado');
    } else if (req.query.token) {
      console.log('Solicitud inicial de página con token en el query');
    }
  }

  if (!token) {
    return res.status(401).send('Acceso denegado. Token no proporcionado.');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('Token verificado, payload:', payload);  // Log del payload del token
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send('Token caducado. Por favor, inicie sesión nuevamente.');
    }
    return res.status(401).send('Token no válido.');
  }
};

module.exports = { register, login, authenticate };

