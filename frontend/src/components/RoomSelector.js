//componentes/RoomSelector.js

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Stack,IconButton,Grid } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const RoomSelector = ({ onSelectRoom }) => {
  const [room, setRoom] = useState('');

  const handleJoinRoom = () => {
    if (room.trim()) {
      onSelectRoom(room.trim());
    }
  };

  const handleLoginClick = () => {
    window.location.href ='/login';
  };

  return (
    <Box sx={{ backgroundColor: '#36393f', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column' }}>
    <Grid container sx={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
  
      {/* Botón para volver al login */}
      <IconButton sx={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1 }} color="primary" onClick={handleLoginClick}>
        <LogoutIcon />
      </IconButton>
      
      {/* Contenido principal */}
      <Grid item xs={12} md={6} sx={{
        backgroundColor: '#2f3136', padding: '20px', display: 'flex', flexDirection: 'column',
        boxSizing: 'border-box', overflowY: 'auto', justifyContent: 'center', alignItems: 'center'
      }}>
        <Stack spacing={3} sx={{
          marginTop: '20px', padding: '30px', width: { xs: '80%', sm: '60%' }, borderRadius: 8, backgroundColor: '#4B4453',
          justifyContent: 'center', alignItems: 'center'
        }}>
          <Typography variant="h4" align="center">¡Bienvenid@!<br/>Entra a una reunión</Typography>
          <Typography variant="body1" align="center">
            Para unirte a una sala, ingresa el nombre de la sala y haz clic en el
            botón "Unirse a la sala".
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Nombre de la sala"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            fullWidth
            InputProps={{
              sx: {
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#AB47BC' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#AB47BC' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#AB47BC' }
              }
            }}
            autoComplete='off'
          />
          <Button variant="contained" color="secondary" size="large" onClick={handleJoinRoom}>Entrar en la sala</Button>
        </Stack>
      </Grid>
  
      {/* Grid para la imagen de fondo */}
      <Grid item xs={12} md={6} sx={{
        display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center',
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundImage: 'url("https://mir-s3-cdn-cf.behance.net/projects/max_808/e6f9bb93319173.Y3JvcCw5MjAsNzIwLDcyLDA.png")'
      }}>
      </Grid>
    </Grid>
  </Box>
  );
};

export default RoomSelector;
