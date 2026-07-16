import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";

const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "your-google-client-id");
const facebookEnabled = !!(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_ID !== "your-facebook-client-id");

const providers: any[] = [];

if (googleEnabled) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  );
}

if (facebookEnabled) {
  providers.push(
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    })
  );
}

providers.push(
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

        const data = await res.json().catch(() => null);
        if (res.status === 200 && data?.data?.access_token) {
          return {
            id: "admin",
            email: credentials?.email as string,
            name: "Admin Jogjagem",
            image: null,
          };
        }
      } catch {
        return null;
      }
      return null;
    },
  })
);

const handler = NextAuth({
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = "admin";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as string;
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
});

export const { handlers, signIn, signOut, auth } = handler;
export const GET = handler.GET;
export const POST = handler.POST;
