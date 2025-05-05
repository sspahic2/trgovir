'use client';

import { SessionProvider } from "next-auth/react";
import './globals.css';
import Navigation from "@/components/Navigation";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideNavOnRoutes = ["/auth/login", "/table/print"];
  const shouldShowNav = !hideNavOnRoutes.some(path => pathname.startsWith(path));

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {shouldShowNav && <Navigation />}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
