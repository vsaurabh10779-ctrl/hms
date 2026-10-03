import { NextResponse } from "next/server";
import {
  getAppointments,
  createAppointment,
  getPatients,
  getDoctors,
  patientExists,
  doctorExists,
} from "@/lib/db";

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
  if (!patientExists(patientId)) {
    return NextResponse.json({ error: "Selected patient does not exist" }, { status: 400 });
  }
  if (!doctorExists(doctorId)) {
    return NextResponse.json({ error: "Selected doctor does not exist" }, { status: 400 });
  }
  try {
    const appointment = createAppointment({
      patientId,
      doctorId,
      date,
      status: "Scheduled",
      notes: String(body.notes || ""),
    });
    return NextResponse.json({ appointment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create appointment" }, { status: 500 });
  }
}