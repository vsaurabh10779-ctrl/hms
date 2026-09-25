import { dashboard } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  Scheduled: "bg-amber-100 text-amber-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

export default function Home() {
  const data = dashboard();
  const cards = [
    { label: "Patients", value: data.patientCount, to: "/patients", tone: "from-teal-500 to-cyan-600" },
    { label: "Doctors", value: data.doctorCount, to: "/doctors", tone: "from-violet-500 to-purple-600" },
    { label: "Appointments", value: data.appointmentCount, to: "/appointments", tone: "from-amber-500 to-orange-600" },
    { label: "Today's appointments", value: data.todayCount, to: "/appointments", tone: "from-rose-500 to-pink-600" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Hospital overview at a glance.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.to}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.tone} p-6 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{c.label}</p>
            <p className="mt-2 text-4xl font-extrabold">{c.value}</p>
            <p className="mt-3 text-xs font-medium text-white/70">View →</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Recent appointments</h2>
          </div>
          {data.recent.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-400">No appointments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-3 font-semibold">Patient</th>
                    <th className="px-6 py-3 font-semibold">Doctor</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((a: any) => (
                    <tr key={a.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-6 py-3 font-medium text-slate-800">{a.patient}</td>
                      <td className="px-6 py-3 text-slate-600">
                        {a.doctor} <span className="text-slate-400">· {a.specialty}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">{a.date}</td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[a.status] || "bg-slate-100 text-slate-600"}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Doctors by specialty</h2>
          </div>
          {data.bySpecialty.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-400">No doctors yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 px-6 py-2 text-sm">
              {data.bySpecialty.map((s: any) => (
                <li key={s.specialty} className="flex items-center justify-between py-3">
                  <span className="text-slate-700">{s.specialty}</span>
                  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700">
                    {s.c}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}