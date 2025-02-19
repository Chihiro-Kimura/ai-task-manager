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
        console.log('🔍 Signing in user:', user.email);

        // Supabase でユーザーを検索
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('❌ Error fetching user:', fetchError);
          return false;
        }

        if (!existingUser) {
          console.log('🆕 Creating new user:', user.email);
          const { data: newUser, error: upsertError } = await supabase
            .from('users')
            .upsert(
              [
                {
                  email: user.email,
                  name: user.name,
                  image: user.image || null,
                  updated_at: new Date().toISOString(),
                },
              ],
              {
                onConflict: 'email', // emailカラムでの競合を処理
                ignoreDuplicates: false, // 更新を許可
              }
            )
            .select('id')
            .single();

          if (upsertError) {
            console.error('❌ Error creating user:', upsertError);
            return false;
          }

          user.id = newUser.id;
        } else {
          // 既存ユーザーの情報を更新
          const { error: updateError } = await supabase
            .from('users')
            .update({
              name: user.name,
              image: user.image || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingUser.id);

          if (updateError) {
            console.error('❌ Error updating user:', updateError);
          }

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

          const { data: userData, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.user.email)
            .single();

          if (error || !userData) {
            console.error('❌ Session callback error - Supabase fetch:', error);
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
