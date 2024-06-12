//frontend/src/components/Trivia.js

import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

const Trivia = ({ room, username, socket }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(10);
  const [scores, setScores] = useState([]);
  const [gameOver, setGameOver] = useState(false);




  useEffect(() => {
    if (socket) {
      socket.emit('joinRoom', room);
      socket.on('startTrivia', (questions) => {
        console.log('Trivia started with questions:', questions);
        setQuestions(questions);
        setCurrentQuestion(0);
        setAnswers([]);
        setGameOver(false);
        setTimer(10);
      });

      socket.on('receiveAnswer', (data) => {
        setAnswers((prev) => [...prev, data]);
      });

      socket.on('updateScores', (scores) => {
        setScores(scores);
      });
    }

    return () => {
      if (socket) {
        socket.off('startTrivia');
        socket.off('receiveAnswer');
        socket.off('updateScores');
      }
    };
  }, [room, socket]);

  useEffect(() => {
    if (timer === 0 && currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimer(10);
    } else if (timer === 0 && currentQuestion === questions.length - 1) {
      setGameOver(true);
      socket.emit('getScores', room);
    }

    if (!gameOver) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer, currentQuestion, gameOver, socket, room, questions.length]);

  const handleAnswerClick = (option) => {
    socket.emit('submitAnswer', {
      room,
      userId: socket.id,
      username,
      questionIndex: currentQuestion,
      answer: option,
      timeTaken: 10 - timer
    });
  };

  const startTrivia = () => {
    console.log('Starting trivia');
    socket.emit('startTrivia', room);
  };

  const restartTrivia = () => {
    startTrivia();
  };

  if (gameOver) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 2,
        }}
      >
        <Typography variant="h1">Juego Terminado</Typography>
        <Typography variant="h2">Puntuaciones:</Typography>
        <ul>
          {scores.map((score, index) => (
            <li key={index}>{score.username}: {score.points}</li>
          ))}
        </ul>
        <Button onClick={restartTrivia}>Jugar de Nuevo</Button>
      </Box>
    );
  }

  if (questions.length === 0) {
    return <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 2,
      }}
    >
      <Button variant="contained" color='secondary' onClick={startTrivia}>
        Iniciar Trivia
      </Button>
    </Box>
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 2,
        backgroundColor: '#36393f', // Color gris oscuro
        width: 'fit-content', // Ajustar el ancho al contenido
        maxWidth: '80%', // Establecer un ancho máximo
        borderRadius: '8px', // Borde redondeado
        margin: 'auto', // Centrar horizontalmente
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: 2, color: 'white' }}>
        Juego de Trivia
      </Typography>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h5" color="white">
          Pregunta {currentQuestion + 1} de {questions.length}
        </Typography>
        <Typography variant="h6" color="white">{questions[currentQuestion].question}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {questions[currentQuestion].options.map((option, index) => (
            <Button key={index} variant="outlined" onClick={() => handleAnswerClick(option)}>
              {option}
            </Button>
          ))}
        </Box>
        <Typography variant="body1" color="white">Tiempo restante: {timer} segundos</Typography>
      </Box>
      <Box>
        <Typography variant="h5" color="white">Respuestas:</Typography>
        <ul>
          {answers.map((answer, index) => (
            <li key={index} style={{ color: 'white' }}>
              {answer.username}: {answer.answer} {answer.isCorrect ? '✓' : '✗'} (+{answer.points} puntos)
            </li>
          ))}
        </ul>
      </Box>
    </Box>
  );
};

export default Trivia;




