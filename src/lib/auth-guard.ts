import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { isSuperAdmin } from "@/repositories/email.repository";

export async function requireSuperAdmin(): Promise<{ email: string }> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const email = session.user.email;
  const isAdmin = await isSuperAdmin(email);

  if (!isAdmin) {
    throw new Error("Not authorized");
  }

  return { email };
}
