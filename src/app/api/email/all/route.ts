import { NextResponse } from "next/server";
import { getAllAllowedEmails } from "@/repositories/email.repository";
import { requireSuperAdmin } from "@/lib/auth-guard";

export async function GET() {
  try {
    await requireSuperAdmin();
    const result = await getAllAllowedEmails();
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
