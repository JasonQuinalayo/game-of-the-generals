/* eslint-disable no-restricted-globals */
import React, { useRef, useEffect, useState } from 'react';
import Board from '../GameObjects/Board';
import VideoChat from './VideoChat';

const Game = (props) => {
  const {
    playerPieces, reconnectGameState, imagesLoaded, socket, name,
  } = props;
  const [board, setBoard] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [enemyReady, setEnemyReady] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(false);
  const [playMode, setPlayMode] = useState(false);
  const [boardReady, setBoardReady] = useState(false);
  const [gameHalted, setGameHalted] = useState(false);
  const [boardInitialized, setBoardInitialized] = useState(0);
  const canvasRef = useRef();
  const readyButtonRef = useRef();
  const ctxRef = useRef();
  const canvasWidth = 900;
  const canvasHeight = 680;
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    setBoard(new Board(ctx, canvasWidth, canvasHeight));
    ctxRef.current = ctx;
  }, []);
  useEffect(() => {
    if (imagesLoaded === 15 && board && playerPieces) {
      if (boardInitialized === 0) {
        board.init(playerPieces);
        setBoardInitialized(1);
      }
      if (boardInitialized === 1 && reconnectGameState) {
        setPlayMode(reconnectGameState.playMode);
        setCurrentTurn(reconnectGameState.currentTurn);
        setEnemyReady(reconnectGameState.enemyReady);
        board.restore(reconnectGameState);
        setBoardInitialized(2);
      }
    }
  }, [reconnectGameState, imagesLoaded, board, playerPieces, boardInitialized]);
  const handleMouseDown = (e) => {
    if (board === null || (playerReady && !playMode) || gameHalted) return;
    const elementPosition = canvasRef.current.getBoundingClientRect();
    board.handleMouseDown(
      e.pageX - (elementPosition.left + window.scrollX),
      e.pageY - (elementPosition.top + window.scrollY),
    );
  };
  const handleMouseMove = (e) => {
    if (board === null || gameHalted) return;
    const elementPosition = canvasRef.current.getBoundingClientRect();
    board.handleMouseMove(
      e.pageX - (elementPosition.left + window.scrollX),
      e.pageY - (elementPosition.top + window.scrollY),
    );
  };
  const handleMouseUp = () => {
    if (board === null || gameHalted) return;
    const pendingGameStateUpdate = board.handleMouseUp();
    if (pendingGameStateUpdate === null) return;
    socket.emit('move', pendingGameStateUpdate);
  };
  const handleReadyButton = () => {
    if (boardReady) {
      readyButtonRef.current.style.backgroundColor = !playerReady ? 'blue' : '';
      socket.emit('ready', !playerReady);
      setPlayerReady(!playerReady);
    }
  };
  const handleLeaveGameButton = () => {
    localStorage.removeItem('socket-id');
    location.reload();
  };
  useEffect(() => {
    if (playerReady && enemyReady && board) {
      board.play();
      setPlayMode(true);
    }
  }, [playerReady, enemyReady, board]);
  useEffect(() => {
    if (boardReady) {
      readyButtonRef.current.style.opacity = '1.0';
    } else {
      readyButtonRef.current.style.opacity = '0.5';
    }
  }, [boardReady]);
  useEffect(() => {
    if (!socket) return () => {};
    socket.on('update-game-state', (boardState, turn, elimPieces, enemyMovement) => {
      board.updateGameState(boardState, elimPieces, enemyMovement);
      if (!playMode) {
        setBoardReady(board.isReady());
      }
      setCurrentTurn(turn);
    });
    socket.on('enemy-ready', (ready) => {
      setEnemyReady(ready);
      board.setEnemyReady(ready);
      board.draw();
    });
    socket.on('game-over', (isWinner) => {
      setGameHalted(true);
      board.gameOver(isWinner);
    });
    socket.on('enemy-disconnected', () => {
      board.enemyDisconnected();
      setGameHalted(true);
    });
    socket.on('enemy-reconnected', () => {
      setGameHalted(false);
      board.draw();
    });
    socket.on('disconnected', () => {
      board.serverDisconnected();
      setGameHalted(true);
    });
    return () => {
      socket.off('update-game-state');
      socket.off('enemy-ready');
      socket.off('game-over');
      socket.off('enemy-disconnected');
      socket.off('enemy-reconnected');
      socket.off('disconnected');
    };
  }, [socket, board, playMode]);
  return (
    <div id="gotg-game">
      <div id="gotg-game-board">
        {playMode ? <span>{currentTurn ? 'Your turn' : "Enemy's turn"}</span> : <span>Prepare your pieces</span>}
        <canvas
          width={canvasWidth}
          height={canvasHeight}
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
        <button
          id="gotg-game-ready-button"
          ref={readyButtonRef}
          type="button"
          onClick={handleReadyButton}
          style={playMode ? { display: 'none' } : {}}
        >
          Ready
        </button>
        <br />
      </div>
      <div id="gotg-game-communication">
        <div id="gotg-game-communication-top-row">
          <span>GOTG</span>
          <button
            type="button"
            id="gotg-leave-game-button"
            onClick={handleLeaveGameButton}
          >
            Leave game
          </button>
        </div>
        <VideoChat name={name} socket={socket} reconnectGameState={reconnectGameState} />
      </div>
    </div>
  );
};

export default Game;
