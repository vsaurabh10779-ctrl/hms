import { NextResponse } from "next/server";
import { getPatients, createPatient } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ patients: getPatients() });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
  }
  const patient = createPatient({
    name,
    age: Number(body.age) || 0,
    gender: String(body.gender || ""),
    phone: String(body.phone || ""),
    address: String(body.address || ""),
    bloodGroup: String(body.bloodGroup || ""),
  });
  return NextResponse.json({ patient }, { status: 201 });
}