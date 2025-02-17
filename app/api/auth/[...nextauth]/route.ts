import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabase } from '@/lib/supabase';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { User, Account, Profile } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({
      user,
    }: {
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile;
    }) {
      if (!user.email) return false;
      try {
        const { data: existingUser, error: selectError } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          console.error('Select error:', selectError);
          return false;
        }

        if (!existingUser) {
          const newUserData = {
            email: user.email,
            name: user.name || '',
            avatar_url: user.image || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([newUserData])
            .select()
            .single();

          if (insertError) {
            console.error('Insert error:', insertError);
            return false;
          }

          if (newUser) {
            user.id = newUser.id;
            return true;
          }
        } else {
          user.id = existingUser.id;
          return true;
        }

        return false;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile;
    }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
