import React, { useState } from 'react';
import NavBar from '../components/Navbar';

const Settings = () => {
  const [email, setEmail] = useState('joseph@hospital.com'); // Initialize with default or fetched value
  const [darkMode, setDarkMode] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const [notifyAppointments, setNotifyAppointments] = useState(false);
  const [notifyMessages, setNotifyMessages] = useState(false);
  const [notifyPatients, setNotifyPatients] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  return (
    <div className='bg-gray-100 min-h-screen'>
      <NavBar />
      <header className="settings-header p-6 bg-white mb-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-gray-600">Manage your account, profile, and preferences</p>
      </header>
      <section className="settings-section p-6 bg-white mb-4">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="settings-info mb-4">
          <label className="block text-gray-700">Email: </label>
          <div className="flex justify-between items-center">
            <div>{email}</div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Change</button>
          </div>
        </div>
        <div className="settings-info">
          <label className="block text-gray-700">Password: </label>
          <div>********</div>
        </div>
      </section>
      <section className="settings-section p-6 bg-white mb-4">
        <h2 className="text-xl font-semibold mb-4">User Preferences</h2>
        <div className="settings-switch mb-4">
          <label className="block text-gray-700">Dark mode</label>
          <input 
            type="checkbox" 
            className="form-checkbox h-5 w-5 text-indigo-600"
          />
        </div>
        <div className="settings-switch mb-4">
          <label className="block text-gray-700">Receive tips and updates</label>
          <input 
            type="checkbox" 
            className="form-checkbox h-5 w-5 text-indigo-600"
          />
        </div>
      </section>
      <section className="settings-section p-6 bg-white mb-4">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <form >
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input 
              type="email" 
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
              placeholder="Enter user email" 
              value={inviteEmail} 
              onChange={(e) => setInviteEmail(e.target.value)} 
            />
          </div>
          <button 
            type="submit" 
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Send Invite
          </button>
        </form>
      </section>
      <section className="settings-section p-6 bg-white">
        <h2 className="text-xl font-semibold mb-4">Help</h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Using the App</h3>
          <p className="text-gray-700">You can use the Home screen to add a new user. Fill in all the required fields and then press the "Add Patient" button.</p>
          <p className="text-gray-700">The Notification screen shows the list of notifications. When you click a notification, a modal appears with more details about the notification.</p>
        </div>
      </section>
    </div>
  );
};

export default Settings;
