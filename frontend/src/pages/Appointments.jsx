import { useState, useEffect, useCallback } from 'react';
import { fetchAppointments, updateAppointmentStatus, deleteAppointment } from '../api';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

// Helper: returns badge CSS class based on status
function badgeClass(status) {
  if (status === 'Completed') return 'badge badge-completed';
  if (status === 'Cancelled') return 'badge badge-cancelled';
  return 'badge badge-scheduled';
}

// Appointments page - view, filter, update, delete appointments
export default function Appointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load appointments from API with current filters
  const loadAppointments = useCallback(() => {
    fetchAppointments(user.id, user.role, {
      search, doctor: doctorFilter, status: statusFilter
    }).then(setAppointments);
  }, [user, search, doctorFilter, statusFilter]);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  // Handle status update (for doctors)
  const handleStatusChange = async (id, status) => {
    await updateAppointmentStatus(id, status);
    setToast({ message: `Status updated to ${status}`, type: 'success' });
    loadAppointments();
  };

  // Handle delete with confirmation
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteAppointment(deleteTarget);
    setDeleteTarget(null);
    setToast({ message: 'Appointment deleted.', type: 'success' });
    loadAppointments();
  };

  return (
    <div className="page-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Appointment"
          message="Are you sure you want to delete this appointment? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="page-header">
        <h2>Appointments</h2>
        <p>{user.role === 'doctor' ? 'Manage appointments assigned to you' : 'View and manage your appointments'}</p>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input className="search-input" placeholder="Search by patient name..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <input className="filter-select" placeholder="Filter by doctor..." style={{ minWidth: 180 }}
          value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)} />
        <select className="filter-select" value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option>Scheduled</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* Appointments Table */}
      {appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No appointments found.</p>
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
                <th>Symptoms</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id}>
                  <td style={{ fontWeight: 500 }}>{apt.patientName}</td>
                  <td>
                    <div>{apt.doctorName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.specialization}</div>
                  </td>
                  <td>{new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td>{apt.time}</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {apt.symptoms}
                  </td>
                  <td><span className={badgeClass(apt.status)}>{apt.status}</span></td>
                  <td>
                    <div className="table-actions">
                      {/* Doctor can update status */}
                      {user.role === 'doctor' && apt.status === 'Scheduled' && (
                        <>
                          <button className="btn btn-sm btn-primary"
                            onClick={() => handleStatusChange(apt.id, 'Completed')}>✓ Complete</button>
                          <button className="btn btn-sm btn-outline"
                            onClick={() => handleStatusChange(apt.id, 'Cancelled')}>✕ Cancel</button>
                        </>
                      )}
                      {/* Patient can delete */}
                      {user.role === 'patient' && (
                        <button className="btn btn-sm btn-danger"
                          onClick={() => setDeleteTarget(apt.id)}>🗑 Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
