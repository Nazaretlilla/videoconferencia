// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import VideoConference from './components/VideoConference';
import { Button, Box, Typography, Stack } from '@mui/material';

function App() {

  const handleLoginClick = () => {
    window.location.href = '/login';
  };


  return (
    <Router >
      <Routes>
        <Route
          path="/"
          element={
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                textAlign: 'center',
                backgroundImage: 'linear-gradient(135deg, #512DA8 15%, #000 90%)', // Fondo con gradiente
                padding: 4,
                color: 'white', // Texto en color blanco para contrastar
                backdropFilter: 'blur(5px)', // Efecto de desenfoque al fondo
              }}
            >
              <Typography variant="h2" component="h1" gutterBottom>
                Welcome to Our Video Conference App
              </Typography>


              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 4 ,
                  mt: 4,
                  padding:2,
                  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)', // Sombras en las imágenes
                }}
              >
                {/* Primera imagen */}
                <Stack direction="column" spacing={2} alignItems="center">
                  <Box sx={{ textAlign: 'center', width: 200, height: 200, position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
                    <img
                      src="https://hackbrightacademy.com/content/uploads/2016/01/puppy-coding.jpg"
                      alt="Junama "
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                    />
                  </Box>
                  <Typography variant="body1" sx={{ color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '4px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    Juanma Manuel Becerra Cumbrera
                  </Typography>
                </Stack>

                {/* Segunda imagen */}
                <Stack direction="column" spacing={2} alignItems="center">
                  <Box sx={{ textAlign: 'center', width: 200, height: 200, position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
                    <img
                      src="https://www.godaddy.com/resources/wp-content/uploads/2011/03/integrate-email-with-social-media.jpg?size=3840x0"
                      alt="Nazaret"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                    />
                  </Box>
                  <Typography variant="body1" sx={{ color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '4px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    Nazaret Medina Juan
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Button variant="outlined" color="secondary" onClick={handleLoginClick}>
                  Get Started →
                </Button>
              </Box>
            </Box>

          } />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/videoconferencia" element={<VideoConference />} />
      </Routes>
    </Router>
  );
}

export default App;

