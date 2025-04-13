import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { TableRepository } from "@/repositories/table.repository";

export async function GET() {
  try {
    await requireSuperAdmin();
    const result = await TableRepository.getAll();
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Fetch all failed", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
