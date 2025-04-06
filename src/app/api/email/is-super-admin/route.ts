import { NextResponse } from "next/server";
import { isSuperAdmin } from "@/repositories/email.repository";

export async function POST(req: Request) {
  const { email } = await req.json();
  const result = await isSuperAdmin(email);
  return NextResponse.json({ result });
}
