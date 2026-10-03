# HMS - Hospital Management System

Minimal hospital management MVP built with Next.js 16, Tailwind CSS and SQLite (node:sqlite).

## Modules
- Dashboard (counts, recent appointments, doctors by specialty)
- Patients (register, list, edit, delete)
- Doctors (specialties, fees, edit, delete)
- Appointments (patient + doctor + date, edit, delete)

Deleting a patient or doctor also removes that person's appointments (cascade
delete, wrapped in a transaction so it either fully succeeds or fully rolls back).

## Run
```
npm install
npm run dev
```
Opens on http://localhost:3000 (or 3001 if 3000 is busy).

Demo data seeds automatically on first start. DB lives in data/hms.db.
Requires Node 22.5+ (uses the built-in `node:sqlite` module).

## Routes
| Route | Description |
|---|---|
| / | Dashboard |
| /patients | Manage patients |
| /doctors | Manage doctors |
| /appointments | Manage appointments |
| /api/patients | Patients API (GET/POST) |
| /api/patients/[id] | Update (PUT) / delete (DELETE) one patient |
| /api/doctors | Doctors API (GET/POST) |
| /api/doctors/[id] | Update (PUT) / delete (DELETE) one doctor |
| /api/appointments | Appointments API (GET/POST) |
| /api/appointments/[id] | Update (PUT) / delete (DELETE) one appointment |

`PUT` is a partial update: only the fields you send are changed, so editing an
appointment's notes does not reset its status.

