'use client';

import { useEffect, useState } from "react";

export default function AccessDeniedPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setError(params.get("error"));
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-red-500">Access Denied</h1>
        <p className="mt-4 text-center text-lg">
          You do not have permission to sign in. Please contact an administrator for access.
        </p>
        <div className="mt-6 text-center">
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Try signing in again
          </a>
        </div>
      </div>
    </div>
  );
}
