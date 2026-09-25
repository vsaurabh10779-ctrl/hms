"use client";

import CrudPanel from "@/components/CrudPanel";

const columns = [
  { key: "name", label: "Name", render: (v: any) => <span className="font-semibold text-slate-900">{v}</span> },
  { key: "age", label: "Age" },
  { key: "gender", label: "Gender" },
  { key: "bloodGroup", label: "Blood group", render: (v: any) => (v ? v : "—") },
  { key: "phone", label: "Phone", render: (v: any) => (v ? v : "—") },
  { key: "address", label: "Address", render: (v: any) => (v ? v : "—") },
];

const fields = [
  { name: "name", label: "Full name", required: true, placeholder: "e.g. Aarav Sharma" },
  { name: "age", label: "Age", type: "number", required: true },
  { name: "gender", label: "Gender", type: "select", required: true, options: [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ]},
  { name: "phone", label: "Phone", placeholder: "+91 …" },
  { name: "bloodGroup", label: "Blood group", type: "select", options: [
    { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
    { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
    { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
  ]},
  { name: "address", label: "Address" },
];

export default function PatientsPage() {
  return (
    <CrudPanel
      title="Patients"
      subtitle="Register and manage patients."
      endpoint="/api/patients"
      columns={columns}
      fields={fields}
      initial={{ name: "", age: "", gender: "", phone: "", bloodGroup: "", address: "" }}
    />
  );
}