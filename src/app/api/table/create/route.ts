import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { TableService } from "@/services/table.service";
import { TableRepository } from "@/repositories/table.repository";
 
export async function POST(req: Request) {
  try {
    await requireSuperAdmin();
    const data = await req.json();
    console.log("📥 Incoming row data:", data);
    const result = await TableRepository.create(data);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Create failed", err);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
