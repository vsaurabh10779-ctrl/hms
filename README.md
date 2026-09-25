# HMS - Hospital Management System

Minimal hospital management MVP built with Next.js 16, Tailwind CSS and SQLite (node:sqlite).

## Modules
- Dashboard (counts, recent appointments, doctors by specialty)
- Patients (register, list)
- Doctors (specialties, fees)
- Appointments (patient + doctor + date)

## Run

pm install then 
pm run dev - opens on http://localhost:3000 (or 3001 if 3000 is busy).

Demo data seeds automatically on first start. DB lives in data/hms.db.
## Routes
| Route | Description |
|---|---|
| / | Dashboard |
| /patients | Manage patients |
| /doctors | Manage doctors |
| /appointments | Manage appointments |
| /api/patients | Patients API (GET/POST) |
| /api/doctors | Doctors API (GET/POST) |
| /api/appointments | Appointments API (GET/POST) |

