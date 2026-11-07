import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "hermes-luxoa-secret-key-2026",
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const email = (credentials.email as string).trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: {
            email
          }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        if (user.status === "PENDING") {
          throw new Error("Akun Anda masih menunggu proses verifikasi Admin.");
        }

        if (user.status === "REJECTED") {
          throw new Error("Pendaftaran ditolak: " + (user.rejectionReason || "Silakan hubungi Admin."));
        }

        if (user.status === "SUSPENDED") {
          throw new Error("Akun Anda telah dinonaktifkan / disuspend oleh Admin Breakout Record.");
        }

        return user;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.status = user.status;
      } else if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true, status: true },
          });
          if (dbUser) {
            // @ts-ignore
            token.role = dbUser.role;
            // @ts-ignore
            token.status = dbUser.status;
          }
        } catch (_) {}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        // @ts-ignore
        session.user.role = token.role;
        // @ts-ignore
        session.user.status = token.status;
      }
      return session;
    },
    authorized({ request, auth }) {
      return true;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
