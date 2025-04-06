'use client';

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoginPage() {
  function handleSignIn() {
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get("callbackUrl") || "/";
    signIn("google", { callbackUrl });
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{
        background: 'radial-gradient(circle at center, var(--color-secondary) 0%, #3b3b3b 100%)',
      }}
    >
      <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8 w-full max-w-sm flex flex-col items-center space-y-6">
        
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <Image 
            src="/logo.jpg" 
            alt="Logo"
            fill 
            sizes="200px"
            style={{ objectFit: 'contain' }}
          />
        </div>

        <h1 className="text-xl font-semibold">Sign in to Trgovir</h1>

        <button
          onClick={handleSignIn}
          className="flex items-center space-x-3 border border-gray-300 rounded px-5 py-2 bg-white hover:shadow transition cursor-pointer"
        >
          <Image
            src="/google.svg"
            alt="Google logo"
            width={20}
            height={20}
            className="object-contain"
          />
          <span className="text-sm font-medium">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}
