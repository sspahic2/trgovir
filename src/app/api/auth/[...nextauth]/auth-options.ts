import GoogleProvider from "next-auth/providers/google";
import { isEmailAllowed } from "@/repositories/email.repository";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async signIn({ user }) {
      return await isEmailAllowed(user?.email);
    },
    async session({ session }) {
      const email = session.user?.email || "";
      const isAdmin = await isEmailAllowed(email);
      session.user.isSuperAdmin = isAdmin;
      return session;
    },
    async jwt({ token }) {
      const email = token?.email;
      token.isSuperAdmin = await isEmailAllowed(email);
      return token;
    },
  },
};
