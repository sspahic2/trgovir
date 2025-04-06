'use client';

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EmailService } from "@/services/email.service";

export default function HomeRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;

    const check = async () => {
      const isAdmin = await EmailService.isSuperAdmin(session?.user?.email || "");
      router.replace(isAdmin ? "/superadmin" : "/dashboard");
    };

    check();
  }, [session, status, router]);

  return null;
}
