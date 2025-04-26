// src/app/api/configuration/update/route.ts
import { NextResponse } from "next/server";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { requireSuperAdmin } from "@/lib/auth-guard";

export async function PUT(req: Request) {
  await requireSuperAdmin();
  const { id, configuration, selectedCoords } = await req.json();
  const result = await ConfigurationRepository.update(
    id,
    configuration,
    selectedCoords,
    new Date()
  );
  return NextResponse.json({ result });
}
