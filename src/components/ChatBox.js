/* eslint-disable react/no-array-index-key */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';

const ChatBox = (props) => {
  const { socket, name, enemyName } = props;
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [pressedEnter, setPressedEnter] = useState(false);
  const messageBoxRef = useRef();
  const textAreaRef = useRef();

  const appendMessage = useCallback((sender, message) => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];
      newMessages.unshift([sender, message]);
      return newMessages;
    });
  }, []);

  const handleSendMessage = () => {
    if (!typedMessage) return;
    appendMessage(name, typedMessage);
    setTypedMessage('');
    socket.emit('message', typedMessage);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      if (!pressedEnter) {
        handleSendMessage();
        setPressedEnter(true);
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      setPressedEnter(false);
    }
  };

  useEffect(() => {
    messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!socket) return () => {};
    socket.on('enemy-message', (message) => {
      appendMessage(enemyName, message);
    });
    return () => {
      socket.off('enemy-message');
    };
  }, [socket, enemyName, appendMessage]);

  return (
    <div id="gotg-chat-box">
      <div id="gotg-chat-box-message-box" ref={messageBoxRef}>
        {messages.map((message) => (
          <div className="gotg-chat-box-message">
            <span
              className={message[0] === name ? 'gotg-chat-box-name gotg-chat-box-own-name' : 'gotg-chat-box-name gotg-chat-box-enemy-name'}
            >
              {message[0]}
            </span>
            :
            {message[1]}
          </div>
        ))}
      </div>
      <div id="gotg-chat-box-input">
        <textarea
          value={typedMessage}
          onChange={(e) => { setTypedMessage(e.target.value); }}
          rows={3}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          ref={textAreaRef}
        />
        <button type="button" onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
