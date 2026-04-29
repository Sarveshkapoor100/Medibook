import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { Login, Register } from './pages/Auth';
import Doctors from './pages/Doctors';
import BookAppointment from './pages/BookAppointment';
import Appointments from './pages/Appointments';
import Dashboard from './pages/Dashboard';

export default function App() {
  // Store logged-in user in state (persisted in sessionStorage for page refreshes)
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('medibook_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login handler - stores user in state + sessionStorage
  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem('medibook_user', JSON.stringify(userData));
  };

  // Logout handler - clears user data
  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('medibook_user');
  };

  return (
    <BrowserRouter>
      {/* Show navbar only when logged in */}
      {user && <Navbar user={user} onLogout={handleLogout} />}

      <Routes>
        {/* Auth routes - redirect to home if already logged in */}
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} />

        {/* Protected routes - redirect to login if not authenticated */}
        <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/login" />} />
        <Route path="/doctors" element={user ? <Doctors user={user} /> : <Navigate to="/login" />} />
        <Route path="/book" element={
          user?.role === 'patient' ? <BookAppointment user={user} /> : <Navigate to="/" />
        } />
        <Route path="/appointments" element={user ? <Appointments user={user} /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}
