import React, { useEffect, useState, useRef } from 'react';

const MainMenu = (props) => {
  const {
    socket, setPlayerPieces, setName,
  } = props;
  const [typedGameCode, setTypedGameCode] = useState('');
  const [receivedGameCode, setReceivedGameCode] = useState('');
  const [notification, setNotification] = useState('');
  const [localName, setLocalName] = useState('');
  const [noMatchFoundTimer, setNoMatchFoundTimer] = useState(null);
  const notifRef = useRef();
  const handleJoinGame = () => {
    setNotification('');
    if (!localName) {
      setNotification('Please enter name');
      return;
    }
    socket.emit('join-game', typedGameCode);
  };

  const handleCreateGame = () => {
    setNotification('');
    if (!localName) {
      setNotification('Please enter name');
      return;
    }
    socket.emit('new-game');
  };

  const handleTypeName = (e) => {
    if (e.target.value.length >= 25) {
      setLocalName((prevLocalName) => prevLocalName);
    } else {
      setLocalName(e.target.value);
    }
  };

  useEffect(() => {
    notifRef.current.innerHTML = notification;
  }, [notification]);

  useEffect(() => {
    if (!socket) return () => {};
    socket.on('new-game-code', (gameCode) => {
      setReceivedGameCode(gameCode);
      setNotification(`Your Game Code is <br /> <strong>${gameCode}</strong> <br /> Waiting for opponent`);
      const timeout = setTimeout(() => {
        setReceivedGameCode('');
        setNotification('No match found try again');
      }, 300000);
      setNoMatchFoundTimer(timeout);
    });
    socket.on('match-found', (player) => {
      localStorage.setItem('socket-id', socket.id);
      setPlayerPieces(player);
      setName(localName);
      clearTimeout(noMatchFoundTimer);
    });
    socket.on('invalid-game-code', () => setNotification('invalid game code'));
    socket.on('duplicate-id', () => setNotification('A game is already associated with this client'));
    return () => {
      socket.off('new-game-code');
      socket.off('match-found');
      socket.off('invalid-game-code');
      socket.off('duplicate-id');
    };
  }, [socket, setPlayerPieces, setName, localName, noMatchFoundTimer]);

  return (
    <div id="gotg-main-menu">
      <h2>Game of the Generals</h2>
      <span><a href="https://en.wikipedia.org/wiki/Game_of_the_Generals" target="_blank" rel="noreferrer">Info</a></span>
      <div id="gotg-main-menu-interface" style={receivedGameCode ? { display: 'none' } : {}}>
        <input
          id="gotg-main-menu-name-input"
          value={localName}
          onChange={handleTypeName}
          placeholder="Name"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.keyCode === 13) { handleCreateGame(); } }}
        />
        <br />
        <button type="button" onClick={handleCreateGame}>Create Game</button>
        <br />
        <span id="gotg-main-menu-or">or</span>
        <br />
        <input
          value={typedGameCode}
          placeholder="Game Code"
          onChange={(e) => { setTypedGameCode(e.target.value); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.keyCode === 13) { handleJoinGame(); } }}
        />
        <button type="button" onClick={handleJoinGame}>
          Join Game

        </button>
      </div>
      <br />
      <span ref={notifRef} />
    </div>
  );
};

export default MainMenu;
