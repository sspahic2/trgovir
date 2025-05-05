import { NextResponse } from "next/server";
import { TableRepository } from "@/repositories/table.repository";

export async function POST(req: Request) {
  const body = await req.json();
  const { table, rows } = body;

  const table_saved = await TableRepository.createWithRows(table, rows);
  return NextResponse.json({ result: table_saved });
}
