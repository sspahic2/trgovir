import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { TableRepository } from "@/repositories/table.repository";

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();
    const { id } = await req.json();
    const result = await TableRepository.getById(id);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Get by ID failed", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
