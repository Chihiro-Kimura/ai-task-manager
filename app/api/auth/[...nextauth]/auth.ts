import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabase } from '@/lib/supabase';

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
        // Supabaseでユーザーを検索または作成
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select()
          .eq('email', user.email)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching user:', fetchError);
          return false;
        }

        if (!existingUser) {
          // 新規ユーザーを作成
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
              {
                email: user.email,
                name: user.name,
                image: user.image,
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating user:', insertError);
            return false;
          }

          user.id = newUser.id;
        } else {
          user.id = existingUser.id;
        }

        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },
    async session({ session }) {
      try {
        if (session.user?.email) {
          // Supabaseからユーザー情報を取得
          const { data: userData, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.user.email)
            .single();

          if (error) throw error;

          // セッションにユーザーIDを追加
          return {
            ...session,
            user: {
              ...session.user,
              id: userData.id,
            },
          };
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
  },
} as const;

export default NextAuth(authOptions);
