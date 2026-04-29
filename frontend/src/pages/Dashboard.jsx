import { useState, useEffect } from 'react';
import { fetchDashboard } from '../api';

// Dashboard page with summary stats and recent appointments
export default function Dashboard({ user }) {
  const [data, setData] = useState({ total: 0, completed: 0, scheduled: 0, cancelled: 0, recent: [] });

  useEffect(() => {
    fetchDashboard(user.id, user.role).then(setData);
  }, [user]);

  const stats = [
    { label: 'Total', value: data.total, icon: '📊', cls: 'total' },
    { label: 'Scheduled', value: data.scheduled, icon: '🕐', cls: 'scheduled' },
    { label: 'Completed', value: data.completed, icon: '✅', cls: 'completed' },
    { label: 'Cancelled', value: data.cancelled, icon: '❌', cls: 'cancelled' },
  ];

  function badgeClass(status) {
    if (status === 'Completed') return 'badge badge-completed';
    if (status === 'Cancelled') return 'badge badge-cancelled';
    return 'badge badge-scheduled';
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome back, {user.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label} Appointments</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="page-header" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Recent Appointments</h2>
      </div>

      {data.recent.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No appointments yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map(apt => (
                <tr key={apt.id}>
                  <td style={{ fontWeight: 500 }}>{apt.patientName}</td>
                  <td>{apt.doctorName}</td>
                  <td>{new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td>{apt.time}</td>
                  <td><span className={badgeClass(apt.status)}>{apt.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
