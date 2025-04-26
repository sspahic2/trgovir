// src/app/api/table/all/route.ts
import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { TableRepository } from "@/repositories/table.repository";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const result = await TableRepository.getPaginated(page, pageSize);

    return NextResponse.json({ result });
  } catch (err) {
    console.error("Fetch paginated tables failed", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
