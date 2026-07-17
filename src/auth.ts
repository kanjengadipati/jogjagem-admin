import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081";
        try {
          const res = await fetch(`${backendUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
              device_name: "explore-jogja-admin",
            }),
          });

          const data = await res.json().catch(() => ({}));
          if (res.ok && data?.data?.access_token) {
            return {
              id: data.data.user_id ?? "admin",
              email: credentials?.email as string,
              name: data.data.name ?? "Admin Jogjagem",
              accessToken: data.data.access_token,
            } as any;
          } else {
            console.error("Login failed:", res.status, data);
            return null;
          }
        } catch {
          return null;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = "admin";
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as string;
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
