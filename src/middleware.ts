import { withAuth } from "next-auth/middleware";

const SUPERADMIN_PATHS = ["/superadmin", "/superadmin/shapes/create"];

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;

      if (SUPERADMIN_PATHS.some((path) => pathname.startsWith(path))) {
        return !!token?.isSuperAdmin;
      }

      return !!token; // allow authenticated users to all other routes
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});


export const config = {
  matcher: [
    "/((?!api/auth|_next/|favicon.ico|auth/login|/|[^/]+\\.png|[^/]+\\.jpg|[^/]+\\.jpeg|[^/]+\\.svg|[^/]+\\.webp|[^/]+\\.gif).*)",
  ],
};