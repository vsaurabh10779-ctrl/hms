import { NextResponse } from "next/server";
import { updateAppointment, deleteAppointment, patientExists, doctorExists } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const rowId = parseId(id);
  if (!rowId) {
    return NextResponse.json({ error: "Invalid appointment id" }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const patch = {};
  if (body.patientId !== undefined) {
    const patientId = Number(body.patientId);
    if (!patientId || !patientExists(patientId)) {
      return NextResponse.json({ error: "Selected patient does not exist" }, { status: 400 });
    }
    patch.patientId = patientId;
  }
  if (body.doctorId !== undefined) {
    const doctorId = Number(body.doctorId);
    if (!doctorId || !doctorExists(doctorId)) {
      return NextResponse.json({ error: "Selected doctor does not exist" }, { status: 400 });
    }
    patch.doctorId = doctorId;
  }
  if (body.date !== undefined) patch.date = String(body.date || "");
  if (body.notes !== undefined) patch.notes = String(body.notes || "");
  if (patch.date === "") {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }
  try {
    const appointment = updateAppointment(rowId, patch);
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json({ appointment });
  } catch {
    return NextResponse.json({ error: "Could not update appointment" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const rowId = parseId(id);
  if (!rowId) {
    return NextResponse.json({ error: "Invalid appointment id" }, { status: 400 });
  }
  try {
    if (!deleteAppointment(rowId)) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete appointment" }, { status: 500 });
  }
}