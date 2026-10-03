import { NextResponse } from "next/server";
import { updatePatient, deletePatient } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const rowId = parseId(id);
  if (!rowId) {
    return NextResponse.json({ error: "Invalid patient id" }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
  }
  try {
    const patient = updatePatient(rowId, {
      name,
      age: Number(body.age) || 0,
      gender: String(body.gender || ""),
      phone: String(body.phone || ""),
      address: String(body.address || ""),
      bloodGroup: String(body.bloodGroup || ""),
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    return NextResponse.json({ patient });
  } catch {
    return NextResponse.json({ error: "Could not update patient" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const rowId = parseId(id);
  if (!rowId) {
    return NextResponse.json({ error: "Invalid patient id" }, { status: 400 });
  }
  try {
    const result = deletePatient(rowId);
    if (!result.deleted) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, appointments: result.appointments });
  } catch {
    return NextResponse.json({ error: "Could not delete patient" }, { status: 500 });
  }
}