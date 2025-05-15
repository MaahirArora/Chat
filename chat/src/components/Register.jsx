import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Register = ({setUser}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/chat');
      } else {
        setMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className='Login-page'>
        <form className='auth' onSubmit={handleSubmit}>
            <h1 style={{textAlign:'center',color:'white'}}>Register</h1>
            <input
                type="text"
                placeholder="Username"
                className='usepass'
                value={username}
                onChange={(e) => {setUsername(e.target.value);setUser(e.target.value);}}
                required
            />
            <input 
                type='email'
                placeholder='Enter Email'
                className='usepass'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                className='usepass'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <br /><br />
            <button type="submit" className='loginbutton' style={{marginBottom:'15px',fontSize:'15px',width:'25%'}}>Register</button>
            {message && <p>{message}</p>}
        </form>
    </div>
  );
};

export default Register;