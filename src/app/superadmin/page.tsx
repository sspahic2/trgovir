'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmailService } from "@/services/email.service";

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const load = async () => {
      const email = session?.user?.email || "";
      const isAdmin = await EmailService.isSuperAdmin(email);
      if (!isAdmin) {
        router.replace("/dashboard");
        return;
      }
      const all = await EmailService.getAll();
      setEmails(all);
    };

    load();
  }, [status, session, router]);

  async function handleAddEmail() {
    if (emailInput && !emails.includes(emailInput)) {
      await EmailService.add(emailInput);
      setEmails(await EmailService.getAll());
      setEmailInput("");
    }
  }

  async function handleRemoveEmail(email: string) {
    await EmailService.remove(email);
    setEmails(await EmailService.getAll());
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Super Admin Email Access Control</h1>
      <div className="flex items-center mb-4 gap-2">
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="border px-4 py-2 rounded w-full"
          placeholder="Enter email to allow"
        />
        <button
          onClick={handleAddEmail}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Allowed Emails:</h2>
      <ul className="space-y-2">
        {emails.map((email) => (
          <li key={email} className="flex justify-between items-center border p-2 rounded">
            <span>{email}</span>
            <button
              onClick={() => handleRemoveEmail(email)}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
