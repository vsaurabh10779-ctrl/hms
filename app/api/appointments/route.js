import { NextResponse } from "next/server";
import { getAppointments, createAppointment, getPatients, getDoctors } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    appointments: getAppointments(),
    patients: getPatients(),
    doctors: getDoctors(),
  });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const patientId = Number(body.patientId);
  const doctorId = Number(body.doctorId);
  const date = String(body.date || "");
  if (!patientId || !doctorId || !date) {
    return NextResponse.json({ error: "Patient, doctor and date are required" }, { status: 400 });
  }
  const appointment = createAppointment({
    patientId,
    doctorId,
    date,
    status: "Scheduled",
    notes: String(body.notes || ""),
  });
  return NextResponse.json({ appointment }, { status: 201 });
}