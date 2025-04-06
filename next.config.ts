import type { NextConfig } from "next";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {}
  }
};

export default nextConfig;
