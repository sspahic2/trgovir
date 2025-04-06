import { NextResponse } from "next/server";
import { addAllowedEmail } from "@/repositories/email.repository";
import { requireSuperAdmin } from "@/lib/auth-guard";

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();

    const { email } = await req.json();
    await addAllowedEmail(email);
    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
