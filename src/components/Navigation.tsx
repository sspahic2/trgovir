'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { EmailService } from '@/services/email.service';
import '@/css/navigation.css';

export default function Navigation() {
  const { data: session } = useSession();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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
    <nav className="glass-nav">
      <div className="glass-nav-links">
        <Link href="/dashboard" className="glass-nav-link">Home</Link>
        {isSuperAdmin && (
          <Link href="/superadmin" className="glass-nav-link">Admin Panel</Link>
        )}
      </div>
    </nav>
  );
  
}
