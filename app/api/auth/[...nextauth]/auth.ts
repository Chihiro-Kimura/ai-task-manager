import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';

// グローバルで1つのPrismaClientインスタンスを保持
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        console.log('🔍 Signing in user:', user.email);

        // ユーザーを検索
        const existingUser = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
        });

        if (!existingUser) {
          console.log('🆕 Creating new user:', user.email);
          const newUser = await prisma.user.upsert({
            where: {
              email: user.email,
            },
            update: {
              name: user.name,
              image: user.image || null,
            },
            create: {
              email: user.email,
              name: user.name,
              image: user.image || null,
            },
          });

          user.id = newUser.id;
        } else {
          // 既存ユーザーの情報を更新
          await prisma.user.update({
            where: {
              id: existingUser.id,
            },
            data: {
              name: user.name,
              image: user.image || null,
            },
          });

          user.id = existingUser.id;
        }

        console.log('✅ User ID set in signIn:', user.id);
        return true;
      } catch (error) {
        console.error('❌ SignIn error:', error);
        return false;
      }
    },

    async session({ session }) {
      try {
        if (session.user?.email) {
          console.log('🔍 Fetching user ID for session:', session.user.email);

          const userData = await prisma.user.findUnique({
            where: {
              email: session.user.email,
            },
          });

          if (!userData) {
            console.log('❌ User not found in session callback');
            return session;
          }

          console.log('✅ User ID set in session:', userData.id);

          return {
            ...session,
            user: {
              ...session.user,
              id: userData.id, // ✅ `session.user.id` をセット
            },
          };
        }
        return session;
      } catch (error) {
        console.error('❌ Session callback error:', error);
        return session;
      }
    },
  },
} as const;

export default NextAuth(authOptions);
