// src/app/api/configuration/create/route.ts
import { NextResponse } from "next/server";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { requireSuperAdmin } from "@/lib/auth-guard";

export async function POST(req: Request) {
  await requireSuperAdmin();
  const { configuration, selectedCoords } = await req.json();      // <— now reads coords
  const result = await ConfigurationRepository.create(configuration, selectedCoords);
  return NextResponse.json({ result });
}