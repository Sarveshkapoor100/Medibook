import { NavLink, useNavigate } from 'react-router-dom';

// Navigation bar component - shown on all pages when logged in
export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="logo-icon">🏥</div>
        <h1>MediBook</h1>
      </div>
      <div className="navbar-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/doctors">Doctors</NavLink>
        {user.role === 'patient' && <NavLink to="/book">Book</NavLink>}
        <NavLink to="/appointments">Appointments</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <div className="nav-user-badge">
          <span className="role-dot"></span>
          {user.name.split(' ')[0]} ({user.role})
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
