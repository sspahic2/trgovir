import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { TableRepository } from "@/repositories/table.repository";

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();
    const { id } = await req.json();
    await TableRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete failed", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
