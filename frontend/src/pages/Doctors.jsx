import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDoctors } from '../api';

// Doctors listing page with search
export default function Doctors({ user }) {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors(search).then(setDoctors);
  }, [search]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Our Specialists</h2>
        <p>Find and book with experienced healthcare professionals</p>
      </div>

      {/* Search bar */}
      <div className="filters-bar">
        <input className="search-input" placeholder="Search by name or specialization..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Doctor cards grid */}
      {doctors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No doctors found matching your search.</p>
        </div>
      ) : (
        <div className="doctors-grid">
          {doctors.map(doc => (
            <div key={doc.id} className="card doctor-card">
              <div className="doctor-avatar">{doc.avatar || doc.name.charAt(0)}</div>
              <div className="doctor-info">
                <h3>{doc.name}</h3>
                <span className="doctor-spec">{doc.specialization}</span>
                <div className="doctor-meta">
                  <span>🎓 {doc.experience} yrs exp</span>
                </div>
                <div className="doctor-availability">
                  {doc.availability?.map(day => (
                    <span key={day} className="day-tag">{day.slice(0, 3)}</span>
                  ))}
                </div>
                {user.role === 'patient' && (
                  <button className="book-btn" onClick={() => navigate('/book', { state: { doctor: doc } })}>
                    📅 Book Appointment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
