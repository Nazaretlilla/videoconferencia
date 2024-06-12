// src/components/VideoConference.js
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import jwtDecode from 'jwt-decode';
import RoomSelector from './RoomSelector';
import Trivia from './Trivia';
import { Box, TextField, Button, Tooltip, Typography, Modal, IconButton, Stack } from '@mui/material';
import { MicOff, Mic, VideocamOff, Videocam, ScreenShare, FiberManualRecord, RadioButtonChecked, CallEnd, Send, Extension } from '@mui/icons-material';
import { styled, keyframes } from '@mui/system';


const VideoConference = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [chatSocket, setChatSocket] = useState(null);
  const [triviaSocket, setTriviaSocket] = useState(null);
  const peerConnectionRef = useRef(null);
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [participants, setParticipants] = useState([]);
  const localStreamRef = useRef(null); // Guardar la referencia del stream local
  const screenStreamRef = useRef(null); // Guardar la referencia del stream de pantalla
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [callDuration, setCallDuration] = useState(0); // en segundos
  const [isRecording, setIsRecording] = useState(false);


  const [openTrivia, setOpenTrivia] = useState(false);//para abrir y cerrar la ventan modal del trivia

  //para abrir el trivia
  const handleOpenTrivia = () => {
    setOpenTrivia(true);
  };
  //para cerralo
  const handleCloseTrivia = () => {
    setOpenTrivia(false);
  };


  //constante de parpadeo
  const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;
  //incono customizado con parpadeo
  const BlinkingIcon = styled(FiberManualRecord)`
  animation: ${blink} 1s infinite;
  color: red; // Puedes cambiar el color según prefieras
  font-size: 2rem; // Ajusta el tamaño según prefieras
`;



  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let callTimer;
    if (room) {
      callTimer = setInterval(() => {
        setCallDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    }

    return () => clearInterval(callTimer);
  }, [room]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No se encontró un token JWT. Por favor inicie sesión.');
      window.location.href = '/login';
      return;
    }

    const decodedToken = jwtDecode(token);
    setUsername(decodedToken.username || 'Anonimo');

    if (room && username) {
      const newSocket = io('http://localhost:3000', {
        extraHeaders: {
          Authorization: 'Bearer ' + token,
        },
      });

      const newChatSocket = io('http://localhost:4000', {
        extraHeaders: {
          Authorization: 'Bearer ' + token,
        },
      });

      const newTriviaSocket = io('http://localhost:5000', {
        query: { username }
      });

      newSocket.emit('join', room);
      newChatSocket.emit('join', room);
      newTriviaSocket.emit('joinRoom', room);

      newSocket.on('message', (data) => {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      });

      newSocket.on('signal', async (data) => {
        if (!peerConnectionRef.current) {
          console.warn('peerConnectionRef.current is not initialized');
          return;
        }

        if (data.candidate) {
          if (peerConnectionRef.current.remoteDescription) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } else {
            console.warn('Remote description is not set yet.');
          }
        } else if (data.sdp) {
          if (data.sdp.type === 'offer') {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            newSocket.emit('signal', { room, sdp: answer });
          } else if (data.sdp.type === 'answer') {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          }
        }
      });

      newChatSocket.on('chatMessage', (data) => {
        setMessages((prevMessages) => [...prevMessages, `${data.username}: ${data.message} (${new Date(data.timestamp).toLocaleTimeString()})`]);
      });

      newChatSocket.on('notification', (notification) => {
        alert(notification);
      });

      newSocket.on('updateParticipants', (participants) => {
        setParticipants(participants);
      });

      newSocket.on('recordingStatus', (status) => {
        alert(status);
      });

      setSocket(newSocket);
      setChatSocket(newChatSocket);
      setTriviaSocket(newTriviaSocket);

      return () => {
        if (newSocket) {
          newSocket.emit('leave', room);
          newSocket.disconnect();
        }
        if (newChatSocket) {
          newChatSocket.disconnect();
        }
        if (newTriviaSocket) {
          newTriviaSocket.disconnect();
        }
        setMessages([]);
      };
    }
  }, [room, username]);


  useEffect(() => {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };

    peerConnectionRef.current = new RTCPeerConnection(config);

    peerConnectionRef.current.ontrack = (event) => {
      if (event.track.kind === 'video') {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('signal', { room, candidate: event.candidate });
      }
    };

    if (room) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localVideoRef.current.srcObject = stream;
          localStreamRef.current = stream;
          stream.getTracks().forEach((track) => {
            peerConnectionRef.current.addTrack(track, stream);
          });

          peerConnectionRef.current.onnegotiationneeded = async () => {
            if (socket) {
              try {
                const offer = await peerConnectionRef.current.createOffer();
                await peerConnectionRef.current.setLocalDescription(offer);
                socket.emit('signal', { room, sdp: peerConnectionRef.current.localDescription });
              } catch (err) {
                console.error('Error during negotiation:', err);
              }
            } else {
              console.warn('Socket is not initialized.');
            }
          };
        })
        .catch((error) => {
          console.error('Error accessing media devices:', error);
        });
    }
  }, [socket, room]);

  const sendMessage = () => {
    if (message.trim() && chatSocket) {
      chatSocket.emit('chatMessage', { username, message, room, timestamp: new Date() });
      setMessage('');
    }
  };

  const handleMuteAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const handleMuteVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        // Informar a los otros participantes sobre el estado del video
        socket.emit('muteVideo', { room, enabled: track.enabled });
      });
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const handleShareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screenStream;

      screenStream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, screenStream);
      });

      screenStream.getVideoTracks()[0].onended = () => {
        // Cuando el usuario deja de compartir la pantalla
        screenStreamRef.current = null;
        // Aquí puedes manejar el fin de la pantalla compartida
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const handleRecord = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      socket.emit('recordingStatus', `${username} ha detenido la grabación.`);
      setIsRecording(false);
    } else if (localStreamRef.current) {
      const stream = localStreamRef.current;
      recorderRef.current = new MediaRecorder(stream);
      recorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      recorderRef.current.onstop = () => {
        const completeBlob = new Blob(chunksRef.current, { type: 'video/mp4' });

        // Crear un enlace de descarga y hacer clic en él programáticamente
        const url = URL.createObjectURL(completeBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'recording.mp4';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        chunksRef.current = [];
        recorderRef.current = null;
      };
      recorderRef.current.start();
      socket.emit('recordingStatus', `${username} ha iniciado la grabación.`);
      setIsRecording(true);
    }
  };

  const handleHangUp = () => {
    if (socket) {
      socket.emit('leave', room);
      setRoom('');
    }
  };

  if (!room) {
    return <RoomSelector onSelectRoom={setRoom} />;
  }

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ backgroundColor: '#36393f', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>


      {/* Chat a la izquierda */}
      <Box sx={{
        backgroundColor: '#2f3136', width: '30%', padding: '20px', display: 'flex', flexDirection: 'column',
        height: '100vh', boxSizing: 'border-box', overflowY: 'auto'
      }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>Chat</Typography>
          <hr />
          <div id="chat" sx={{ flexGrow: 1, overflowY: 'auto', marginBottom: '10px', 'scrollbar-width': 'none', '&::-webkit-scrollbar': { display: 'none', }, display: 'flex', flexDirection: 'column' }}>
            {messages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        </Box>
        <TextField type="text" id="message" placeholder="Escribe un mensaje..."
          value={message} onChange={(e) => setMessage(e.target.value)} sx={{ input: { color: 'white' }, marginBottom: '10px' }} InputProps={{ style: { color: 'white' } }} />
        <Button id="send" onClick={sendMessage} variant="contained" color="secondary" startIcon={< Send />}>Enviar</Button>
      </Box>


      {/* Videoconferencia en el centro */}
      <Box sx={{ width: '100%', height: '100vh', textAlign: 'center', backgroundColor: 'rgba(128, 0, 128, 0.15)' }}>
        <Stack direction='row' spacing={6} alignItems="center" justifyContent="center" style={{ margin: '2% ' }}>

          <p>Hora actual: <br />{currentTime.toLocaleTimeString()}</p>
          <Typography variant="h3" mh={5} gutterBottom c>{room}</Typography>
          <p>Duración de la llamada:<br /> {formatTime(callDuration)}</p>
          <IconButton>{isRecording ? <BlinkingIcon /> : ""}  </IconButton>
        </Stack>

        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <video ref={localVideoRef} id="localVideo" autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}></video>
          <video ref={remoteVideoRef} id="remoteVideo" autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}></video>
        </Box>
      </Box>

      {/* Lista de personas conectadas a la derecha */}
      <Box sx={{ backgroundColor: '#2f3136', width: '20%', padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box', overflowY: 'auto' }}>
        <Typography variant="p" gutterBottom>Participantes</Typography>
        <ul>
          {participants.map((participant, index) => (
            <li key={index}>{participant}</li>
          ))}
        </ul>
      </Box>




      {/* Controles flotantes */}
      <Box sx={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', bgcolor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 4, boxShadow: 3, display: 'flex', gap: 1, p: 2, zIndex: 10
      }}>
        <Tooltip title={isAudioMuted ? "Quitar Audio" : "Activar Audio"} arrow>
          <IconButton color="primary" onClick={handleMuteAudio} sx={{ '&:active .MuiTouchRipple-root': { backgroundColor: 'rgba(33, 150, 243, 0.5)' } }}>
            {isAudioMuted ? <Mic /> : <MicOff />}
          </IconButton>
        </Tooltip>

        <Tooltip title={isVideoMuted ? "Quitar Cámara" : "Activar Cámara"} arrow>
          <IconButton color="primary" onClick={handleMuteVideo} sx={{ '&:active .MuiTouchRipple-root': { backgroundColor: 'rgba(33, 150, 243, 0.5)' } }}>
            {isVideoMuted ? <Videocam /> : <VideocamOff />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Compartir Pantalla" arrow>
          <IconButton color="primary" onClick={handleShareScreen} sx={{ '&:active .MuiTouchRipple-root': { backgroundColor: 'rgba(33, 150, 243, 0.5)' } }}>
            <ScreenShare />
          </IconButton>
        </Tooltip>

        <Tooltip title={isRecording ? "Parar de Grabar" : "Empezar a Grabar"} arrow>
          <IconButton color="error" sx={{ '&:active .MuiTouchRipple-root': { backgroundColor: 'rgba(244, 67, 54, 0.5)' } }} onClick={handleRecord}>
            {isRecording ? <FiberManualRecord /> : <RadioButtonChecked />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Colgar" arrow>
          <IconButton color="secondary" onClick={handleHangUp} sx={{ '&:active .MuiTouchRipple-root': { backgroundColor: 'rgba(156, 39, 176, 0.5)' } }}>
            <CallEnd />
          </IconButton>
        </Tooltip>

        <Tooltip title="Trivia" arrow>
          <IconButton color="success" onClick={handleOpenTrivia} sx={{ '&:active .MuiTouchRipple-root': { backgroundColor: 'rgba(76, 175, 80, 0.5)' } }}>
            <Extension />
          </IconButton>
        </Tooltip>

        <Modal
          open={openTrivia}
          onClose={handleCloseTrivia}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}        >
          <Box
            sx={{
              width: '50%', //ancho del modal al 50% de la ventana
              bgcolor: 'rgba(0, 0, 0, 0.3)', boxShadow: 24, p: 4,
            }}>
            <Trivia room={room} username={username} socket={triviaSocket} /> {/* Pasar el socket de trivia */}
          </Box>


        </Modal>



      </Box>
    </Box>
  );
};

export default VideoConference;












