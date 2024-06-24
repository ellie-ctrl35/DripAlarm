import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Avatar from 'react-avatar'; // Assuming you have this package installed
import logo from '../assets/logo.png'; // Replace with your logo
import { Button } from '@mui/material';

const NavBar = () => {
  const username = localStorage.getItem('username'); // Retrieve the username from localStorage
  console.log('Username:', username);
  const navigate = useNavigate();
  
  return (
    <nav className="bg-gray-100 p-2 w-full border-b border-gray-400 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-4 mr-2" />
          <span className="text-black font-semibold text-lg">JOSEPH IV DRIP</span>
        </div>
        <div className="flex items-center space-x-6">
          <NavLink to="/home" className={({ isActive }) => (isActive ? 'text-indigo-400' : 'text-black hover:text-indigo-400')}>
            Patient Entry
          </NavLink>
          <NavLink to="/notification" className={({ isActive }) => (isActive ? 'text-indigo-400' : 'text-black hover:text-indigo-400')}>
            Notification
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'text-indigo-400' : 'text-black hover:text-indigo-400')}>
            Settings
          </NavLink>
          <Button onClick={() => {
            localStorage.removeItem('username'); // Remove username on logout
            navigate('/');
          }} variant="contained" color="primary">
            Logout
          </Button>
          <Avatar name={username || 'User'} size="40" round={true} />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
