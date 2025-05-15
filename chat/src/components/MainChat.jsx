import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './chat';
import Search from './search';
import { Button } from '@mui/material';
import Sendmessage from './sendmessage';
import Message from './Message';
import '../App.css';
import FormDialog from './formdialogue';

const MainChat = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [person, setPerson] = useState(null);
  const [start, setStart] = useState(false);
  //const[inv, setInv] = useState(false);
  const navigate = useNavigate(); 
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  const changePerson = (e) => {
    setPerson(e);
    setStart(true);
  };
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/getmessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sender: username, receiver: person }),
        });
        const data = await response.json();
        if (response.ok) {
          setMessages(data.messages);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (start && person) {
      fetchMessages();
      const intervalId = setInterval(fetchMessages, 2000);
      return () => clearInterval(intervalId);
    }
  }, [start, person, username]);

  return (
    <div className="App">
      <div 
  className="search" 
  style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
>
  <div style={{ flex: '1',height:'90%' }}>
    <Search changePerson={changePerson} user={username} />
  </div>
  <div style={{ height: '5%'}}>
  <Button variant="contained" onClick={handleDialogOpen} style={{height:'100%' , width:'100%'}}>
        Invite+
      </Button>
      <FormDialog open={dialogOpen} onClose={handleDialogClose} sender={username}/>
  </div>
</div>

      {start ? (
        <div className="chat">
          <div className="chat-with">
            <Chat person={person} />
          </div>
          <div className="Messages">
            {messages.map((msg, index) => (
              <Message key={index} message={msg.text} own={msg.own} />
            ))}
          </div>
          <div className="Sendmessage">
            <Sendmessage
              user={username}
              reciever={person}
              setMessages={setMessages}
              messages={messages}
            />
          </div>
        </div>
      ) : (
        <h1 style={{ color: 'white', alignContent: 'center', marginLeft: '30%' }}>
          Start Chat!
        </h1>
      )}
    </div>
  );
};

export default MainChat;
