import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { TableService } from "@/services/table.service";
import { TableRepository } from "@/repositories/table.repository";

export async function PUT(req: Request) {
  try {
    await requireSuperAdmin();
    const { id, table, rows } = await req.json();

    const result = await TableRepository.updateWithRows(id, table, rows);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Update failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
