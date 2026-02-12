import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createSupabaseServer();

    try {
      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${origin}/login?error=auth_error`);
      }
    } catch (error) {
      console.error('Auth callback exception:', error);
      return NextResponse.redirect(`${origin}/login?error=auth_error`);
    }
  }

  // Redirect to home page after successful auth
  return NextResponse.redirect(origin);
}
