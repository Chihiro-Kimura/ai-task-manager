import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextAuthOptions , getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log('Sign in attempt:', { user, account });
      return true;
    },
    async session({ session, user }) {
      console.log('Session callback:', { session, user });
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

export const auth = () => getServerSession(authOptions);
