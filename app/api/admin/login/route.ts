import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, createAdminToken, verifyAdminPassword } from '../../../lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다. 다시 확인해 주세요.' },
        { status: 401 }
      );
    }

    const token = createAdminToken();

    const response = NextResponse.json(
      { success: true, message: '로그인에 성공했습니다.', token },
      { status: 200 }
    );

    // Set secure HTTP-only cookie (30 days validity)
    const maxAgeSeconds = 30 * 24 * 60 * 60;
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
