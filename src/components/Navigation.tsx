'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { EmailService } from '@/services/email.service';
import { useDropdown } from '@/hooks/useDropdown';
import '@/css/navigation.css';

export default function Navigation() {
  const { data: session } = useSession();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { isOpen, toggle, ref } = useDropdown();

  useEffect(() => {
    const check = async () => {
      if (session?.user?.email) {
        const isAdmin = await EmailService.isSuperAdmin(session.user.email);
        setIsSuperAdmin(isAdmin);
      }
    };
    check();
  }, [session]);

  return (
    <nav className="glass-nav relative">
      <div className="glass-nav-links">
        <Link href="/dashboard" className="glass-nav-link">Home</Link>
        {isSuperAdmin && (
          <Link href="/superadmin" className="glass-nav-link">Admin Panel</Link>
        )}
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2" ref={ref}>
        <div className="relative">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full bg-gray-300 hover:bg-secondary flex items-center justify-center text-sm font-bold text-white transition-transform cursor-pointer hover:scale-105"
          >
            {session?.user?.name?.[0] ?? "?"}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md z-50 ring-1 ring-black/5">
              <div className="px-4 py-3 text-sm text-secondary">
                Hey {session?.user?.name?.split(" ")[0] ?? "there"} 👋
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-center px-4 py-3 text-sm bg-red-500 hover:bg-red-600 text-white cursor-pointer transition-all rounded-b-md"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
