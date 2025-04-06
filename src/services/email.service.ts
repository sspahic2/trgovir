import { post } from "@/services/base.service"

export const EmailService = {
  isSuperAdmin: (email: string) =>
    post<boolean>("/api/email/is-super-admin", { email }),

  isEmailAllowed: (email: string) =>
    post<boolean>("/api/email/is-allowed", { email }),

  getAll: async () => {
    const res = await fetch("/api/email/all");
    if (!res.ok) throw new Error("GET /api/email/all failed");
    const data = await res.json();
    return data.result as string[];
  },

  add: (email: string) =>
    post<true>("/api/email/add", { email }),

  remove: (email: string) =>
    post<true>("/api/email/remove", { email }),
};
