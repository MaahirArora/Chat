import React, { useState } from 'react';
import './sendmessage.css';
import '../App.css';

const Sendmessage = ({ user, reciever,setMessages,messages }) => {
  const [message, setMessage] = useState('');
  const handleSendClick = async (e) => {
    e.preventDefault();
    if (message.trim() !== '') {
      try {
        const response = await fetch('http://localhost:5000/api/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: user,     
            receiver: reciever,  
            message_text: message
          }),
        });
        if (response.ok) {
          setMessage('');
          const result=await response.json();
          setMessages(result.messages);
          // console.log(result.messages);
          // console.log('chimichanga');
        } else {
          const result = await response.json();
          console.error(result.error);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  

  return (
    <form onSubmit={handleSendClick}>
      <input
        className='type'
        type="text"
        value={message}
        placeholder='Write Message...'
        onChange={(e) => setMessage(e.target.value)}
      />
      <button className='send' type='submit' disabled={message.trim() === ''}>
        Send
      </button>
    </form>
  );
};

export default Sendmessage;
