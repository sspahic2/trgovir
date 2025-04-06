import { NextResponse } from "next/server";
import { isEmailAllowed } from "@/repositories/email.repository";

export async function POST(req: Request) {
  const { email } = await req.json();
  const result = await isEmailAllowed(email);
  return NextResponse.json({ result });
}
