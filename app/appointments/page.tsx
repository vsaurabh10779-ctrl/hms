"use client";

import CrudPanel from "@/components/CrudPanel";

const columns = [
  { key: "id", label: "ID", render: (v: any) => <span className="font-mono text-slate-400">#{v}</span> },
  { key: "patient", label: "Patient", render: (v: any) => <span className="font-semibold text-slate-900">{v}</span> },
  { key: "doctor", label: "Doctor", render: (v: any, row: any) => (
    <span>{v} <span className="text-slate-400">· {row.specialty}</span></span>
  )},
  { key: "date", label: "Date" },
  { key: "status", label: "Status", render: (v: any) => (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
      v === "Completed" ? "bg-emerald-100 text-emerald-700"
      : v === "Cancelled" ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700"
    }`}>{v}</span>
  )},
  { key: "notes", label: "Notes", render: (v: any) => (v ? v : "—") },
];

const fields = [
  { name: "patientId", label: "Patient", type: "select", required: true, options: (data: any) =>
    (data.patients || []).map((p: any) => ({ value: p.id, label: `${p.name} (${p.gender}, ${p.age})` })) },
  { name: "doctorId", label: "Doctor", type: "select", required: true, options: (data: any) =>
    (data.doctors || []).map((d: any) => ({ value: d.id, label: `${d.name} — ${d.specialty}` })) },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "notes", label: "Notes", placeholder: "Reason for visit…" },
];

export default function AppointmentsPage() {
  return (
    <CrudPanel
      title="Appointments"
      subtitle="Schedule patient visits with doctors."
      endpoint="/api/appointments"
      columns={columns}
      fields={fields}
      initial={{ patientId: "", doctorId: "", date: "", notes: "" }}
    />
  );
}