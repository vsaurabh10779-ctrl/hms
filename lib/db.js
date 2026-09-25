import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, "hms.db"));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    fee INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL DEFAULT 0,
    gender TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    blood_group TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Scheduled',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  );
`);

const rowToDoctor = (r) => ({
  id: r.id,
  name: r.name,
  specialty: r.specialty,
  phone: r.phone,
  email: r.email,
  fee: r.fee,
  createdAt: r.created_at,
});

const rowToPatient = (r) => ({
  id: r.id,
  name: r.name,
  age: r.age,
  gender: r.gender,
  phone: r.phone,
  address: r.address,
  bloodGroup: r.blood_group,
  createdAt: r.created_at,
});

const rowToAppt = (r) => ({
  id: r.id,
  patientId: r.patient_id,
  doctorId: r.doctor_id,
  patient: r.patient_name,
  doctor: r.doctor_name,
  specialty: r.specialty,
  date: r.date,
  status: r.status,
  notes: r.notes,
  createdAt: r.created_at,
});

export function getDoctors() {
  return db.prepare("SELECT * FROM doctors ORDER BY name").all().map(rowToDoctor);
}

export function createDoctor({ name, specialty, phone = "", email = "", fee = 0 }) {
  const info = db
    .prepare("INSERT INTO doctors (name, specialty, phone, email, fee) VALUES (?,?,?,?,?)")
    .run(name, specialty, phone, email, fee);
  return rowToDoctor(db.prepare("SELECT * FROM doctors WHERE id = ?").get(info.lastInsertRowid));
}

export function deleteDoctor(id) {
  db.prepare("DELETE FROM appointments WHERE doctor_id = ?").run(id);
  db.prepare("DELETE FROM doctors WHERE id = ?").run(id);
}

export function getPatients() {
  return db.prepare("SELECT * FROM patients ORDER BY created_at DESC").all().map(rowToPatient);
}

export function createPatient({ name, age, gender, phone = "", address = "", bloodGroup = "" }) {
  const info = db
    .prepare("INSERT INTO patients (name, age, gender, phone, address, blood_group) VALUES (?,?,?,?,?,?)")
    .run(name, age, gender, phone, address, bloodGroup);
  return rowToPatient(db.prepare("SELECT * FROM patients WHERE id = ?").get(info.lastInsertRowid));
}

export function deletePatient(id) {
  db.prepare("DELETE FROM appointments WHERE patient_id = ?").run(id);
  db.prepare("DELETE FROM patients WHERE id = ?").run(id);
}

export function getAppointments() {
  return db
    .prepare(
      `SELECT a.*, p.name AS patient_name, d.name AS doctor_name, d.specialty
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       ORDER BY a.date DESC, a.id DESC`
    )
    .all()
    .map(rowToAppt);
}

export function createAppointment({ patientId, doctorId, date, status = "Scheduled", notes = "" }) {
  const info = db
    .prepare("INSERT INTO appointments (patient_id, doctor_id, date, status, notes) VALUES (?,?,?,?,?)")
    .run(patientId, doctorId, date, status, notes);
  const r = db
    .prepare(
      `SELECT a.*, p.name AS patient_name, d.name AS doctor_name, d.specialty
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       WHERE a.id = ?`
    )
    .get(info.lastInsertRowid);
  return rowToAppt(r);
}

export function dashboard() {
  const doctorCount = db.prepare("SELECT COUNT(*) c FROM doctors").get().c;
  const patientCount = db.prepare("SELECT COUNT(*) c FROM patients").get().c;
  const appointmentCount = db.prepare("SELECT COUNT(*) c FROM appointments").get().c;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = db
    .prepare("SELECT COUNT(*) c FROM appointments WHERE date = ?")
    .get(today).c;
  const recent = getAppointments().slice(0, 6);
  const bySpecialty = db
    .prepare("SELECT specialty, COUNT(*) c FROM doctors GROUP BY specialty ORDER BY c DESC")
    .all();
  return { doctorCount, patientCount, appointmentCount, todayCount, recent, bySpecialty };
}

function seed() {
  if (db.prepare("SELECT COUNT(*) c FROM patients").get().c > 0) return;
  const doctors = [
    ["Dr. Aisha Verma", "Pediatrics", "+91 98100 11001", "aisha@hms.in", 800],
    ["Dr. Rahul Mehta", "Cardiology", "+91 98100 22002", "rahul@hms.in", 1200],
    ["Dr. Neha Gupta", "General Medicine", "+91 98100 33003", "neha@hms.in", 500],
  ];
  const doctorIds = doctors.map((dd) => createDoctor({ name: dd[0], specialty: dd[1], phone: dd[2], email: dd[3], fee: dd[4] }).id);
  const patientsData = [
    ["Aarav Sharma", 4, "Male", "+91 90000 11111", "Gurugram", "O+"],
    ["Diya Nair", 28, "Female", "+91 90000 22222", "Bengaluru", "A+"],
    ["Mohammed Khan", 62, "Male", "+91 90000 33333", "Delhi", "B+"],
    ["Sanya Iyer", 3, "Female", "+91 90000 44444", "Noida", "AB-"],
  ];
  const patientIds = patientsData.map((pp) => createPatient({ name: pp[0], age: pp[1], gender: pp[2], phone: pp[3], address: pp[4], bloodGroup: pp[5] }).id);
  const future = (days) => {
    const d = new Date(Date.now() + days * 86400000);
    return d.toISOString().slice(0, 10);
  };
  const appts = [
    [patientIds[0], doctorIds[0], future(0), "Scheduled", "Routine check-up"],
    [patientIds[1], doctorIds[1], future(1), "Scheduled", "ECG + consult"],
    [patientIds[2], doctorIds[2], future(-1), "Completed", "Follow-up visit"],
    [patientIds[3], doctorIds[0], future(2), "Scheduled", "Fever consultation"],
  ];
  appts.forEach((a) => createAppointment({ patientId: a[0], doctorId: a[1], date: a[2], status: a[3], notes: a[4] }));
  console.log("[hms] seeded demo data");
}

seed();

export { db };