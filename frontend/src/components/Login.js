// src/components/Login.js
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { Stack, TextField, Typography, Box } from '@mui/material';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      window.location.href = `/videoconferencia?token=${data.token}`;
    } else {
      alert('Error al iniciar sesión');
    }
  };


  const handleRegisterClick = () => {
    window.location.href ='/register';
  };


  
  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
      //backgroundImage: 'url("https://th.bing.com/th/id/OIG4.TjUQ9brtC5fvzepIoXTp?pid=ImgGn")',
      backgroundImage: 'url("https://th.bing.com/th/id/OIG4.TjUQ9brtC5fvzepIoXTp?pid=ImgGn")',

      backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#36393f', color: 'white', padding: '20px',
    }}
    >
      <Box sx={{ backgroundColor: '#36393f', borderRadius: '8px', width: '100%', maxWidth: '400px', padding: '30px' }}>

        <Typography variant="h4" mb={4} align="center" gutterBottom>Iniciar Sesión</Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Nombre de usuario"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              color='secondary'
              backgroundColor='#36393f'
              InputProps={{ sx: { color: '#ccc', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray' } } }}
              InputLabelProps={{ sx: { color: 'gray' } }} autoComplete='off' />
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
              autoComplete='off'
            />

          </Stack>
          <Stack spacing={3} justifyContent="center" alignItems="left" sx={{ marginTop: '20px' }}>
            <Button variant="contained" color="secondary" size="large" type="submit">Iniciar Sesión</Button>
            <Typography variant="body1">¿Aún no tienes cuenta? <Button onClick={handleRegisterClick}  >Registrate</Button> </Typography>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
