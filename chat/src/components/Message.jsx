import React from 'react'
import './Message.css'

function Message({message,own}) {
  return own ? (
    <div className='ownmessage'>
        <div>{message}</div>
    </div>
  ):
  (
    <div className='recievemessage'>
        <div>{message}</div>
    </div>
  );
}

export default Message
