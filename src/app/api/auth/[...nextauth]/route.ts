import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Thông tin đăng nhập",
      credentials: {
        username: { label: "Tên đăng nhập", type: "text" },
        password: { label: "Mật khẩu", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!process.env.NEXT_PUBLIC_API_URL) {
            throw new Error("API URL is not configured");
          }

          const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/auth/login-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: credentials?.username,
              password: credentials?.password,
            }),
          });
          
          const user = await res.json();
          
          if (res.ok && user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              accessToken: user.accessToken
            };
          }
          
          return null;
        } catch (error) {
          console.error("Lỗi xác thực:", error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/authentication/login',
    signOut: '/',
    error: '/authentication/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };