import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = ({setUser}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); 
        navigate('/chat'); 
      } else {
        setUser('');
        setUsername(''); 
        setPassword(''); 
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className='Login-page'>
      <form className='auth' onSubmit={handleLogin}>
        <h1 style={{textAlign:'center',color:'white'}}>Sign-In</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>{ setUsername(e.target.value);setUser(e.target.value);}}
          className='usepass'
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='usepass'
        />
        <a href='' style={{color:'white',margin:'25px'}}>Forgot Password?</a>
        <button type="submit" className='loginbutton' style={{marginBottom:'15px',fontSize:'15px'}}>Login</button>
        <p style={{margin:'2px',color:'white'}}>Don't have an account?</p>
        <Link to="/register" style={{color:'white'}}>Register</Link>
      </form>
    </div>
  );
};

export default Login;
