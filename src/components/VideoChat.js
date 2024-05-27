/* eslint-disable no-console */
/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useEffect, useState, useRef,
} from 'react';
import Peer from 'peerjs';
import { FaCamera, FaMicrophone } from 'react-icons/fa';
import ChatBox from './ChatBox';

const VideoChat = (props) => {
  const { socket, name, reconnectGameState } = props;
  const [peer] = useState(new Peer());
  const [localPeerId, setLocalPeerId] = useState('');
  const [enemyPeerId, setEnemyPeerId] = useState(reconnectGameState ? reconnectGameState.enemyPeerId : '');
  const [localStream, setLocalStream] = useState(null);
  const [peerConnection, setPeerConnetion] = useState(null);
  const [enemyName, setEnemyName] = useState(reconnectGameState ? reconnectGameState.enemyName : '');
  const localVideoRef = useRef();
  const enemyVideoRef = useRef();
  useEffect(() => {
    if (!peer) return () => {};
    peer.on('open', (id) => {
      setLocalPeerId(id);
    });
    peer.on('call', (call) => {
      setPeerConnetion(call);
      if (localStream) {
        call.answer(localStream);
      } else {
        call.answer();
      }
      call.on('stream', (stream) => {
        enemyVideoRef.current.srcObject = stream;
      });
    });
    peer.on('error', (err) => {
      console.log(err.type);
    });
    return () => {
      peer.off('call');
      peer.off('open');
      peer.off('error');
    };
  }, [peer, localStream, enemyName]);
  useEffect(() => {
    if (socket && localPeerId) {
      socket.emit('ids', localPeerId, name);
    }
  }, [socket, localPeerId, name]);
  useEffect(() => {
    if (!socket) return () => {};
    socket.on('enemy-ids', (ids) => {
      setEnemyPeerId(ids.peerId);
      setEnemyName(ids.name);
    });
    return () => {
      socket.off('enemy-ids');
    };
  }, [socket, peer, localStream, peerConnection]);

  const handleTurnOnCamera = () => {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
      .then((stream) => {
        setLocalStream(stream);
        localVideoRef.current.srcObject = stream;
        if (peerConnection) {
          peerConnection.close();
        }
        const call = peer.call(enemyPeerId, stream);
        call.on('stream', (enemyStream) => {
          enemyVideoRef.current.srcObject = enemyStream;
          setPeerConnetion(call);
        });
        call.on('error', (err) => {
          console.log(err);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div id="gotg-video-chat">
      <div id="gotg-video-chat-videos">
        <div className="gotg-video-chat-video-container">
          <video autoPlay ref={enemyVideoRef} />
          <span>{enemyName}</span>
        </div>
        <span>Vs</span>
        <div className="gotg-video-chat-video-container">
          <span>{name}</span>
          <video autoPlay muted ref={localVideoRef} />
        </div>
        <button style={localStream ? { display: 'none' } : {}} type="button" onClick={handleTurnOnCamera}>
          <FaCamera />
          {' '}
          /
          {' '}
          <FaMicrophone />
        </button>
      </div>
      <ChatBox socket={socket} name={name} enemyName={enemyName} />
    </div>
  );
};

export default VideoChat;
