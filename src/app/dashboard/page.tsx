'use client';

import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">Welcome, {session?.user?.name} 🎉</h1>
      <p className="mb-4">You're logged in with Google.</p>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Sign out
      </button>
    </div>
  );
}
