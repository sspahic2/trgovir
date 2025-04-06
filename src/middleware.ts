import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/|favicon.ico|auth/login|/|[^/]+\\.png|[^/]+\\.jpg|[^/]+\\.jpeg|[^/]+\\.svg|[^/]+\\.webp|[^/]+\\.gif).*)",
  ],
};