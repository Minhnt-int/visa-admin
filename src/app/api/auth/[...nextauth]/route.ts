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
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
          
          // Backend API yêu cầu email, không phải username
          const loginField = credentials?.username || credentials?.email;
          
          if (!loginField || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const res = await fetch(`${apiUrl}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: loginField, // Backend yêu cầu email
              password: credentials.password,
            }),
          });
          
          const data = await res.json();
          
          // Kiểm tra response format mới: { success: true, data: { accessToken, refreshToken, user } }
          if (res.ok && data.success && data.data) {
            const { accessToken, refreshToken, user } = data.data;
            
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              accessToken: accessToken,
              refreshToken: refreshToken
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