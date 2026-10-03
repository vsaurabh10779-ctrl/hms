import { NextResponse } from "next/server";
import { updateDoctor, deleteDoctor } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const rowId = parseId(id);
  if (!rowId) {
    return NextResponse.json({ error: "Invalid doctor id" }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const specialty = String(body.specialty || "").trim();
  if (!name || !specialty) {
    return NextResponse.json({ error: "Name and specialty are required" }, { status: 400 });
  }
  try {
    const doctor = updateDoctor(rowId, {
      name,
      specialty,
      phone: String(body.phone || ""),
      email: String(body.email || ""),
      fee: Number(body.fee) || 0,
    });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    return NextResponse.json({ doctor });
  } catch {
    return NextResponse.json({ error: "Could not update doctor" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const rowId = parseId(id);
  if (!rowId) {
    return NextResponse.json({ error: "Invalid doctor id" }, { status: 400 });
  }
  try {
    const result = deleteDoctor(rowId);
    if (!result.deleted) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, appointments: result.appointments });
  } catch {
    return NextResponse.json({ error: "Could not delete doctor" }, { status: 500 });
  }
}