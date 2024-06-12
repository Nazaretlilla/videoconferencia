// src/components/Register.js
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { Stack, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      alert('Usuario registrado exitosamente');
      handleLoginClick();
    } else {
      alert('Error al registrar el usuario');
    }
  };

  const handleLoginClick = () => {
    window.location.href ='/login';
  };



  return (
    <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: 'url("https://th.bing.com/th/id/OIG4.TjUQ9brtC5fvzepIoXTp?pid=ImgGn")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: '#36393f',
      color: 'white',
      padding: '20px',
    }}
  >
    <Box
      sx={{
        backgroundColor: '#36393f',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '400px',
        padding: '30px',
      }}
    >
      <Typography variant="h4" mb={4} align="center" gutterBottom>Registro de Usuario</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Nombre de usuario"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            color='secondary'
            InputProps={{ sx: { color: '#ccc', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray' } } }}
            InputLabelProps={{ sx: { color: 'gray' } }}
          />
          <TextField
            label="Contraseña"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            color='secondary'
            InputProps={{ sx: { color: '#ccc', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray' } } }}
            InputLabelProps={{ sx: { color: 'gray' } }}
          />
        </Stack>
        <Stack spacing={3} justifyContent="center" alignItems="left" sx={{ marginTop: '30px' }}>
          <Button variant="contained" color="secondary" size="large" type="submit">Registrar</Button>
          <Typography variant="body1">Vuelve al Login <Button onClick={handleLoginClick} >Volver</Button> </Typography>
        </Stack>
      </form>
    </Box>
  </Box>
  );
};

export default Register;
