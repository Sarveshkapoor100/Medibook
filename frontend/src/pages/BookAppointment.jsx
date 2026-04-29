import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchDoctors, bookAppointment } from '../api';
import Toast from '../components/Toast';

// Predefined time slots for appointments
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

// Booking form page - allows patients to book appointments
export default function BookAppointment({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const preselected = location.state?.doctor;

  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctorId: preselected?.id || '',
    date: '',
    time: '',
    symptoms: '',
  });
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchDoctors().then(setDoctors); }, []);

  const selectedDoctor = doctors.find(d => d.id === form.doctorId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.doctorId || !form.date || !form.time) {
      setToast({ message: 'Please fill all required fields.', type: 'error' });
      return;
    }
    try {
      await bookAppointment({
        patientId: user.id,
        patientName: user.name,
        doctorId: form.doctorId,
        doctorName: selectedDoctor?.name,
        specialization: selectedDoctor?.specialization,
        date: form.date,
        time: form.time,
        symptoms: form.symptoms,
      });
      setToast({ message: 'Appointment booked successfully!', type: 'success' });
      setTimeout(() => navigate('/appointments'), 1500);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  // Get today's date in YYYY-MM-DD for min date restriction
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h2>Book an Appointment</h2>
        <p>Select a doctor, choose a date and time slot</p>
      </div>

      <div className="card form-card">
        <form onSubmit={handleSubmit}>
          {/* Doctor Selection */}
          <div className="form-group">
            <label>Select Doctor *</label>
            <select value={form.doctorId}
              onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} required>
              <option value="">Choose a doctor...</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Selected doctor info preview */}
          {selectedDoctor && (
            <div className="doctor-preview">
              <div className="doctor-avatar">
                {selectedDoctor.avatar}
              </div>
              <div>
                <div className="doctor-preview-name">{selectedDoctor.name}</div>
                <div className="doctor-preview-meta">
                  {selectedDoctor.specialization} · {selectedDoctor.experience} yrs experience
                </div>
              </div>
            </div>
          )}

          {/* Date and Time */}
          <div className="form-row">
            <div className="form-group">
              <label>Appointment Date *</label>
              <input type="date" min={today} value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
          </div>

          <div className="form-group">
            <label>Select Time Slot *</label>
            <div className="time-slots">
              {TIME_SLOTS.map(slot => (
                <button key={slot} type="button"
                  className={`time-slot ${form.time === slot ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, time: slot }))}>
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div className="form-group">
            <label>Symptoms / Notes</label>
            <textarea placeholder="Describe your symptoms or reason for visit..."
              value={form.symptoms}
              onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}
