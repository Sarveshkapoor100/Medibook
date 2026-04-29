// ============================================
// Healthcare Appointment Booking System - Backend
// Express Server with JSON file-based storage
// ============================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

// --- Middleware ---
app.use(cors());               // Allow requests from React frontend
app.use(express.json());       // Parse JSON request bodies

// --- Helper Functions ---

// Read data from JSON file
function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

// Write data to JSON file
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Generate a unique ID with a prefix
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// ============================================
// AUTH ROUTES
// ============================================

/**
 * POST /register
 * Register a new user (patient or doctor)
 * Body: { name, email, password, role, specialization?, experience?, availability? }
 */
app.post('/register', (req, res) => {
  const { name, email, password, role, specialization, experience, availability } = req.body;

  // Basic validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const data = readData();

  // Check if email already exists
  const existingUser = data.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered.' });
  }

  // Create the new user object
  const newUser = {
    id: generateId(role === 'doctor' ? 'doc' : 'pat'),
    name,
    email,
    password, // Plain text for simplicity (no hashing)
    role
  };

  // Add doctor-specific fields
  if (role === 'doctor') {
    newUser.specialization = specialization || 'General';
    newUser.experience = experience || 0;
    newUser.availability = availability || ['Monday', 'Wednesday', 'Friday'];
    // Create avatar initials from name
    const nameParts = name.replace('Dr. ', '').split(' ');
    newUser.avatar = nameParts.map(p => p[0]).join('').toUpperCase();
  }

  data.users.push(newUser);
  writeData(data);

  // Return user info (without password)
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ message: 'Registration successful!', user: userWithoutPassword });
});

/**
 * POST /login
 * Login with email and password
 * Body: { email, password }
 */
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const data = readData();
  const user = data.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // Return user info (without password)
  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: 'Login successful!', user: userWithoutPassword });
});

// ============================================
// DOCTOR ROUTES
// ============================================

/**
 * GET /doctors
 * Get all doctors, with optional search by name or specialization
 * Query: ?search=cardio
 */
app.get('/doctors', (req, res) => {
  const data = readData();
  let doctors = data.users.filter(u => u.role === 'doctor');

  // Apply search filter if provided
  const { search } = req.query;
  if (search) {
    const term = search.toLowerCase();
    doctors = doctors.filter(d =>
      d.name.toLowerCase().includes(term) ||
      d.specialization.toLowerCase().includes(term)
    );
  }

  // Remove passwords from response
  const safeDoctors = doctors.map(({ password, ...rest }) => rest);
  res.json(safeDoctors);
});

// ============================================
// APPOINTMENT ROUTES
// ============================================

/**
 * GET /appointments
 * Get appointments for a specific user
 * Query: ?userId=pat-1&role=patient&search=&doctor=&status=
 */
app.get('/appointments', (req, res) => {
  const { userId, role, search, doctor, status } = req.query;
  const data = readData();

  let appointments = data.appointments;

  // Filter by role: patients see their own, doctors see theirs
  if (role === 'patient') {
    appointments = appointments.filter(a => a.patientId === userId);
  } else if (role === 'doctor') {
    appointments = appointments.filter(a => a.doctorId === userId);
  }

  // Search by patient name
  if (search) {
    const term = search.toLowerCase();
    appointments = appointments.filter(a =>
      a.patientName.toLowerCase().includes(term)
    );
  }

  // Filter by doctor name
  if (doctor) {
    appointments = appointments.filter(a =>
      a.doctorName.toLowerCase().includes(doctor.toLowerCase())
    );
  }

  // Filter by status
  if (status && status !== 'All') {
    appointments = appointments.filter(a => a.status === status);
  }

  // Sort by date (newest first)
  appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(appointments);
});

/**
 * POST /appointments
 * Book a new appointment
 * Body: { patientId, patientName, doctorId, doctorName, specialization, date, time, symptoms }
 */
app.post('/appointments', (req, res) => {
  const { patientId, patientName, doctorId, doctorName, specialization, date, time, symptoms } = req.body;

  // Validate required fields
  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const data = readData();

  // Check for duplicate booking (same doctor, date, time)
  const duplicate = data.appointments.find(a =>
    a.doctorId === doctorId &&
    a.date === date &&
    a.time === time &&
    a.status !== 'Cancelled' // Allow rebooking cancelled slots
  );

  if (duplicate) {
    return res.status(409).json({ message: 'This time slot is already booked. Please choose another.' });
  }

  // Create new appointment
  const newAppointment = {
    id: generateId('apt'),
    patientId,
    patientName,
    doctorId,
    doctorName,
    specialization,
    date,
    time,
    symptoms: symptoms || 'Not specified',
    status: 'Scheduled',
    createdAt: new Date().toISOString()
  };

  data.appointments.push(newAppointment);
  writeData(data);

  res.status(201).json({ message: 'Appointment booked successfully!', appointment: newAppointment });
});

/**
 * PUT /appointments/:id
 * Update appointment status
 * Body: { status } - "Scheduled", "Completed", or "Cancelled"
 */
app.put('/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Scheduled', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Use: Scheduled, Completed, or Cancelled.' });
  }

  const data = readData();
  const appointmentIndex = data.appointments.findIndex(a => a.id === id);

  if (appointmentIndex === -1) {
    return res.status(404).json({ message: 'Appointment not found.' });
  }

  data.appointments[appointmentIndex].status = status;
  writeData(data);

  res.json({ message: `Status updated to ${status}.`, appointment: data.appointments[appointmentIndex] });
});

/**
 * DELETE /appointments/:id
 * Delete an appointment
 */
app.delete('/appointments/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();

  const appointmentIndex = data.appointments.findIndex(a => a.id === id);

  if (appointmentIndex === -1) {
    return res.status(404).json({ message: 'Appointment not found.' });
  }

  data.appointments.splice(appointmentIndex, 1);
  writeData(data);

  res.json({ message: 'Appointment deleted successfully.' });
});

// ============================================
// DASHBOARD ROUTE
// ============================================

/**
 * GET /dashboard
 * Get dashboard summary stats for a user
 * Query: ?userId=pat-1&role=patient
 */
app.get('/dashboard', (req, res) => {
  const { userId, role } = req.query;
  const data = readData();

  let appointments = data.appointments;

  // Filter by role
  if (role === 'patient') {
    appointments = appointments.filter(a => a.patientId === userId);
  } else if (role === 'doctor') {
    appointments = appointments.filter(a => a.doctorId === userId);
  }

  // Calculate summary statistics
  const total = appointments.length;
  const completed = appointments.filter(a => a.status === 'Completed').length;
  const scheduled = appointments.filter(a => a.status === 'Scheduled').length;
  const cancelled = appointments.filter(a => a.status === 'Cancelled').length;

  // Get 5 most recent appointments
  const recent = [...appointments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  res.json({
    total,
    completed,
    scheduled,
    cancelled,
    recent
  });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`\n🏥 Healthcare Backend running at http://localhost:${PORT}\n`);
});
