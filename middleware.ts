import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';

import type { NextRequest } from 'next/server';

// next-intlミドルウェアの設定
const intlMiddleware = createMiddleware({
  locales: ['ja', 'en'],
  defaultLocale: 'ja',
  localePrefix: 'as-needed'
});

export async function middleware(
  request: NextRequest
): Promise<NextResponse> {
  // APIリクエストの処理
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // 認証エンドポイントはスキップ
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    const response = NextResponse.next();

    // CORSヘッダーの設定
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || 'http://localhost:3000');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // プリフライトリクエストの処理
    if (request.method === 'OPTIONS') {
      return response;
    }

    try {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production',
      });
      
      if (!token) {
        return new NextResponse(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'ログインが必要です。',
            code: 'AUTH_REQUIRED'
          }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(response.headers)
            }
          }
        );
      }

      // トークンが有効な場合、ユーザーIDをヘッダーに追加
      if (token.sub) {
        response.headers.set('X-User-Id', token.sub);
      }

      return response;
    } catch (error) {
      console.error('Auth error:', error);
      return new NextResponse(
        JSON.stringify({
          error: 'Internal Server Error',
          message: '認証処理中にエラーが発生しました。',
          code: 'AUTH_ERROR'
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers)
          }
        }
      );
    }
  }

  // ページリクエストの処理
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // ロケール対応のページルート
    '/((?!_next|_vercel|api|.*\\..*).*)',
    // APIルート（認証エンドポイントを除く）
    '/api/((?!auth).*)'
  ],
};
