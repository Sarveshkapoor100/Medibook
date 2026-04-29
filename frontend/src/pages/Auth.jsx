import { useState } from 'react';
import { loginUser, registerUser } from '../api';

// Login page component
export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await loginUser({ email, password });
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '0.75rem', opacity: 0.8 }}>🏥</div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to MediBook</p>
        {error && <div className="toast toast-error" style={{ position: 'static', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={password}
              onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Sign In</button>
        </form>
        <p className="auth-footer">
          Don't have an account? <a href="/register">Register here</a>
        </p>
        <div className="demo-box">
          <strong>Demo Accounts:</strong><br/>
          Patient: john@mail.com / patient123<br/>
          Doctor: sarah@hospital.com / doctor123
        </div>
      </div>
    </div>
  );
}

// Register page component
export function Register({ onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient',
    specialization: '', experience: '' });
  const [error, setError] = useState('');

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const userData = { ...form };
    if (form.role === 'doctor') {
      userData.experience = parseInt(form.experience) || 0;
      userData.availability = ['Monday', 'Wednesday', 'Friday'];
    }
    const data = await registerUser(userData);
    if (data.user) {
      onLogin(data.user);
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '0.75rem', opacity: 0.8 }}>🏥</div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join MediBook today</p>
        {error && <div className="toast toast-error" style={{ position: 'static', marginBottom: '1rem' }}>{error}</div>}

        <div className="role-toggle">
          <button type="button" className={form.role === 'patient' ? 'active' : ''}
            onClick={() => update('role', 'patient')}>Patient</button>
          <button type="button" className={form.role === 'doctor' ? 'active' : ''}
            onClick={() => update('role', 'doctor')}>Doctor</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder={form.role === 'doctor' ? 'Dr. Jane Smith' : 'John Doe'}
              value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com"
              value={form.email} onChange={e => update('email', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Create a password"
              value={form.password} onChange={e => update('password', e.target.value)} required />
          </div>
          {form.role === 'doctor' && (
            <>
              <div className="form-group">
                <label>Specialization</label>
                <select value={form.specialization} onChange={e => update('specialization', e.target.value)} required>
                  <option value="">Select specialization</option>
                  <option>Cardiology</option><option>Dermatology</option><option>Neurology</option>
                  <option>Orthopedics</option><option>Pediatrics</option><option>General</option>
                </select>
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input type="number" placeholder="e.g. 5" min="0"
                  value={form.experience} onChange={e => update('experience', e.target.value)} required />
              </div>
            </>
          )}
          <button type="submit" className="btn btn-primary btn-block">Create Account</button>
        </form>
        <p className="auth-footer">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
}
