// src/app/api/configuration/delete/route.ts
import { NextResponse } from "next/server";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { requireSuperAdmin } from "@/lib/auth-guard";

export async function DELETE(req: Request) {
  await requireSuperAdmin();
  const { id } = await req.json();
  const result = await ConfigurationRepository.delete(id);
  return NextResponse.json({ result });
}
