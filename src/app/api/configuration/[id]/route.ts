import { NextResponse } from "next/server";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { requireSuperAdmin } from "@/lib/auth-guard";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  await requireSuperAdmin();

  // Next.js now makes params async, so await it first
  const { id: rawId } = await context.params;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const result = await ConfigurationRepository.getById(id);
  return NextResponse.json({ result });
}