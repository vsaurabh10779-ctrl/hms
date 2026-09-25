"use client";

import CrudPanel from "@/components/CrudPanel";

const columns = [
  { key: "name", label: "Name", render: (v: any) => <span className="font-semibold text-slate-900">{v}</span> },
  { key: "specialty", label: "Specialty", render: (v: any) => (
    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{v}</span>
  )},
  { key: "phone", label: "Phone", render: (v: any) => (v ? v : "—") },
  { key: "email", label: "Email", render: (v: any) => (v ? v : "—") },
  { key: "fee", label: "Consultation fee", render: (v: any) => (v > 0 ? `₹${Number(v).toLocaleString("en-IN")}` : "—") },
];

const fields = [
  { name: "name", label: "Full name", required: true, placeholder: "e.g. Dr. Aisha Verma" },
  { name: "specialty", label: "Specialty", required: true, type: "select", options: [
    { value: "General Medicine", label: "General Medicine" },
    { value: "Pediatrics", label: "Pediatrics" },
    { value: "Cardiology", label: "Cardiology" },
    { value: "Gynecology", label: "Gynecology" },
    { value: "Orthopedics", label: "Orthopedics" },
    { value: "Dermatology", label: "Dermatology" },
    { value: "ENT", label: "ENT" },
    { value: "Neurology", label: "Neurology" },
  ]},
  { name: "phone", label: "Phone", placeholder: "+91 …" },
  { name: "email", label: "Email", type: "email", placeholder: "doctor@hospital.in" },
  { name: "fee", label: "Consultation fee (₹)", type: "number" },
];

export default function DoctorsPage() {
  return (
    <CrudPanel
      title="Doctors"
      subtitle="Manage the medical staff."
      endpoint="/api/doctors"
      columns={columns}
      fields={fields}
      initial={{ name: "", specialty: "", phone: "", email: "", fee: "" }}
    />
  );
}