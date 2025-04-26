import { NextResponse } from "next/server";
import { TableRepository } from "@/repositories/table.repository";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, rows } = body;

  const table = await TableRepository.createWithRows(name, rows);
  return NextResponse.json({ result: table });
}
