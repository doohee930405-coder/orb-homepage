import { NextResponse } from 'next/server';
import { recordPageView } from '../../../lib/analyticsDb';

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
    const { slug, path, title, visitorId, sessionId, referrer, type } = body;

    // Validate: Either path or slug must be provided
    if (!slug && !path) {
      return NextResponse.json({ error: '유효한 path 또는 slug가 필요합니다.' }, { status: 400 });
    }

    // Extract Client IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfIp = req.headers.get('cf-connecting-ip');
    const ip = cfIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '127.0.0.1';

    const userAgent = req.headers.get('user-agent') || '';

    // Record view for site and/or column with anti-spam deduplication and UV tracking
    const result = recordPageView({
      path: typeof path === 'string' ? path : undefined,
      slug: typeof slug === 'string' ? slug : undefined,
      title: typeof title === 'string' ? title : undefined,
      visitorId: typeof visitorId === 'string' ? visitorId : '',
      sessionId: typeof sessionId === 'string' ? sessionId : 'default-session',
      ip,
      userAgent,
      referrer: typeof referrer === 'string' ? referrer : '',
      type: type === 'column' ? 'column' : 'site',
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
