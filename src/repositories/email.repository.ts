import { prisma } from "../../lib/prisma";

export async function getAllAllowedEmails(): Promise<string[]> {
  const emails = await prisma.allowedEmail.findMany();
  return emails.map(e => e.email);
}

export async function isEmailAllowed(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const found = await prisma.allowedEmail.findUnique({ where: { email } });
  return !!found;
}

export async function isSuperAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const found = await prisma.allowedEmail.findUnique({ where: { email } });
  return found?.isSuperAdmin ?? false;
}

export async function addAllowedEmail(email: string, isSuperAdmin = false): Promise<void> {
  await prisma.allowedEmail.upsert({
    where: { email },
    update: { isSuperAdmin },
    create: { email, isSuperAdmin },
  });
}

export async function removeAllowedEmail(email: string): Promise<void> {
  await prisma.allowedEmail.delete({ where: { email } });
}
