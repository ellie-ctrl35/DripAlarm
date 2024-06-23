import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Avatar from 'react-avatar'; // Assuming you have this package installed
import logo from '../assets/logo.png'; // Replace with your logo
import { Button } from '@mui/material';

const NavBar = () => {
  const userName = "User Name"; // Replace with dynamic user name
  const navigate = useNavigate();
  return (
    <nav className="bg-gray-100 p-2 w-full border-b border-gray-400 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-4 mr-2" />
          <span className="text-black font-semibold text-lg">JOSEPH IV DRIP</span>
        </div>
        <div className="flex items-center space-x-6">
          <NavLink to="/home" activeClassName="text-indigo-400" className="text-black hover:text-indigo-400">
            Patient Entry
          </NavLink>
          <NavLink to="/notification" activeClassName="text-indigo-400" className="text-black hover:text-indigo-400">
            Notification
          </NavLink>
          <NavLink to="/settings" activeClassName="text-indigo-400" className="text-black hover:text-indigo-400">
            Settings
          </NavLink>
          <Button onClick={()=>navigate('/')} variant="contained" color="primary">
            Logout
          </Button>
          <Avatar name={userName} size="40" round={true} />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
