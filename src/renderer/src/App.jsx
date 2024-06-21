
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Notifications from './pages/Notification/Notifications';
import Settings from './pages/Settings';

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  return (
    <div style={{width:"100vw",height:"100vh"}}>

    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/notification" element={<Notifications />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
    
    </BrowserRouter>
    </div>
  )
}

export default App

