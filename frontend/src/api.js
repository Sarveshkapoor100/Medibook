// API base URL - points to our Express backend
const API = 'http://localhost:5000';

// --- Auth APIs ---
export async function registerUser(userData) {
  const res = await fetch(`${API}/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function loginUser(credentials) {
  const res = await fetch(`${API}/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

// --- Doctor APIs ---
export async function fetchDoctors(search = '') {
  const url = search ? `${API}/doctors?search=${encodeURIComponent(search)}` : `${API}/doctors`;
  const res = await fetch(url);
  return res.json();
}

// --- Appointment APIs ---
export async function fetchAppointments(userId, role, filters = {}) {
  const params = new URLSearchParams({ userId, role, ...filters });
  const res = await fetch(`${API}/appointments?${params}`);
  return res.json();
}

export async function bookAppointment(data) {
  const res = await fetch(`${API}/appointments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
}

export async function updateAppointmentStatus(id, status) {
  const res = await fetch(`${API}/appointments/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function deleteAppointment(id) {
  const res = await fetch(`${API}/appointments/${id}`, { method: 'DELETE' });
  return res.json();
}

// --- Dashboard API ---
export async function fetchDashboard(userId, role) {
  const params = new URLSearchParams({ userId, role });
  const res = await fetch(`${API}/dashboard?${params}`);
  return res.json();
}
