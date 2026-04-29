import { useNavigate } from 'react-router-dom';

// Home page with hero section and feature highlights
export default function Home({ user }) {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="hero">
        <h1>Your Health, Our Priority</h1>
        <p>Book appointments with top specialists instantly. Modern healthcare management made simple and accessible.</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          {user.role === 'patient' && (
            <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}
              onClick={() => navigate('/book')}>
              Book Appointment
            </button>
          )}
          <button className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '1rem' }}
            onClick={() => navigate('/doctors')}>
            View Doctors
          </button>
        </div>

        <div className="hero-features">
          <div className="hero-feature">
            <div className="feat-icon" style={{ background: 'var(--accent-light)' }}>🩺</div>
            <h3>Expert Doctors</h3>
            <p>Access top specialists across cardiology, neurology, pediatrics, and more.</p>
          </div>
          <div className="hero-feature">
            <div className="feat-icon" style={{ background: 'var(--success-light)' }}>⚡</div>
            <h3>Instant Booking</h3>
            <p>Choose your doctor, pick a slot, and confirm in seconds.</p>
          </div>
          <div className="hero-feature">
            <div className="feat-icon" style={{ background: 'rgba(209,199,189,0.35)' }}>📊</div>
            <h3>Track & Manage</h3>
            <p>View, update, or cancel appointments from your dashboard anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
