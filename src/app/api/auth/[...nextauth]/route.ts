import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

// Danh sách tài khoản cứng để test
const validAccounts = [
  {
    username: "admin",
    password: "admin",
    userData: {
      id: "1",
      name: "Admin",
      email: "admin@example.com",
      accessToken: "test-admin-token"
    }
  },
  {
    username: "user",
    password: "user123",
    userData: {
      id: "2",
      name: "Test User",
      email: "user@example.com",
      accessToken: "test-user-token"
    }
  }
];

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
          // Kiểm tra tài khoản cứng trước
          const validAccount = validAccounts.find(
            acc => acc.username === credentials?.username && 
                  acc.password === credentials?.password
          );
          
          if (validAccount) {
            return validAccount.userData;
          }

          // Nếu không tìm thấy trong danh sách cứng, kiểm tra với API
          if (process.env.NEXT_PUBLIC_API_URL) {
            try {
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
            } catch (apiError) {
              console.error("Lỗi khi gọi API:", apiError);
            }
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
    error: '/authentication/login', // Redirect errors to login
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };