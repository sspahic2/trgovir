// src/app/api/configuration/all/route.ts
import { NextResponse } from "next/server";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { requireSuperAdmin } from "@/lib/auth-guard";

export async function GET() {
  await requireSuperAdmin();
  const result = await ConfigurationRepository.getAll();
  return NextResponse.json({ result });
}
