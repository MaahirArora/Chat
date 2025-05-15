import React from 'react';
import './chat.css';

function Chat({person}) {
  return (
    <div className='Wrapper'>
        <h1>{person}</h1>
    </div>
  );
}

export default Chat;
