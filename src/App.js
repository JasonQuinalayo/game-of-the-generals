import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Game from './components/Game';
import Logos from './components/Logos';
import MainMenu from './components/MainMenu';
import './App.css';

const App = () => {
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [socket, setSocket] = useState(null);
  const [playerPieces, setPlayerPieces] = useState(null);
  const [tryReconnect, setTryReconnect] = useState(false);
  const [reconnectGameState, setReconnectGameState] = useState(null);
  const [name, setName] = useState('');

  useEffect(() => {
    const newSocket = io('https://game-of-the-generals-server.onrender.com');
    const prevSocketId = localStorage.getItem('socket-id');
    newSocket.emit('try-reconnect', prevSocketId || '');
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return () => {};
    socket.on('reconnect-status', (gameState, pieces) => {
      setTryReconnect(true);
      if (gameState) {
        setReconnectGameState(gameState);
        setPlayerPieces(pieces);
        setName(gameState.name);
        localStorage.setItem('socket-id', socket.id);
      }
    });
    socket.on('multiple-client', () => {
      alert('You have an open game. Please leave other game before starting a new one');
    });
    return () => {
      socket.off('reconnect-status');
      socket.off('multiple-client');
    };
  }, [socket]);

  return (
    <div id="gotg">
      <Logos setImagesLoaded={setImagesLoaded} />
      {tryReconnect
        ? (!playerPieces
          ? (
            <MainMenu
              setName={setName}
              socket={socket}
              setPlayerPieces={setPlayerPieces}
            />
          )
          : (
            <div>
              <Game
                name={name}
                reconnectGameState={reconnectGameState}
                playerPieces={playerPieces}
                socket={socket}
                imagesLoaded={imagesLoaded}
              />
            </div>
          ))
        : <p>Loading</p>}
    </div>
  );
};

export default App;
