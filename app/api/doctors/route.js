import { NextResponse } from "next/server";
import { getDoctors, createDoctor } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ doctors: getDoctors() });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const specialty = String(body.specialty || "").trim();
  if (!name || !specialty) {
    return NextResponse.json({ error: "Name and specialty are required" }, { status: 400 });
  }
  const doctor = createDoctor({
    name,
    specialty,
    phone: String(body.phone || ""),
    email: String(body.email || ""),
    fee: Number(body.fee) || 0,
  });
  return NextResponse.json({ doctor }, { status: 201 });
}