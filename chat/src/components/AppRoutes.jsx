import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import MainChat from './MainChat';
import Register from './Register';

const AppRoutes = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const [user, setUser] = useState('');
  return (
    <Routes>
      <Route path="/" element={<Login setUser={setUser} />} />
      <Route 
        path='/register'
        element={<Register setUser={setUser} />}
      />
      <Route
        path="/chat"
        element={isAuthenticated ? <MainChat username={user}/> : <Navigate to="/login" />}
      />
    </Routes>
  );
  //console.log(user);
};

export default AppRoutes;
