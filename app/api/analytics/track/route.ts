import { NextResponse } from 'next/server';
import { recordColumnView } from '../../../lib/analyticsDb';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { slug, visitorId, sessionId } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: '유효한 slug가 필요합니다.' }, { status: 400 });
    }

    // Extract Client IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfIp = req.headers.get('cf-connecting-ip');
    const ip = cfIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '127.0.0.1';

    const userAgent = req.headers.get('user-agent') || '';

    // Record view with anti-spam deduplication and unique visitor tracking
    const result = recordColumnView({
      slug,
      visitorId: visitorId || '',
      sessionId: sessionId || 'default-session',
      ip,
      userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        recorded: result.recorded,
        isDuplicate: result.isDuplicate,
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    console.error('Analytics track error:', err);
    return NextResponse.json(
      { success: false, error: '조회수 기록 실패' },
      { status: 500 }
    );
  }
}
