import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const IMAGE_MAP: Record<string, string> = {
  'thumbnails/qeeg-guide-thumb.png':
    'https://postfiles.pstatic.net/MjAyNjA5MTVfMjAz/MDAxNzg5NDY4MzU3OTA3.nQf7QUyuw23RTnuNv2GBkwOh9GeWdUKe3foaKNYfWlog.sNZB6x1yOBFN8yRmjqJm3EcYqepaldlMsQx4cZyrCMEg.PNG/image.png?type=w966',
  'qeeg-analysis-sample.png':
    'https://postfiles.pstatic.net/MjAyNjA5MTVfMjAz/MDAxNzg5NDY4MzU3OTA3.nQf7QUyuw23RTnuNv2GBkwOh9GeWdUKe3foaKNYfWlog.sNZB6x1yOBFN8yRmjqJm3EcYqepaldlMsQx4cZyrCMEg.PNG/image.png?type=w966',
  'qeeg-10-20-system.png':
    'https://postfiles.pstatic.net/MjAyNjA5MTVfMTY3/MDAxNzg5NDY4ODg0NzI5.lAZq04yDyBrnj-Bft-5X-aK9OzvOt_nMYSZ9yHwfK3og.CCRjOkLO7DEkatUPqdwEiT4-wldGH2HABekw1gW7L5kg.PNG/image.png?type=w966',
  'qeeg-wet-sensor-cap.png':
    'https://postfiles.pstatic.net/MjAyNjA5MTVfODgg/MDAxNzg5NDY5MTgwNjIy.0AXNt_aq5QGrY_i_TQkz2-jjVrr3xBn4bYoCyUOfTAAg.pi_QA93HCu84p-X6fUs84gfWeWgVvSYGqj7WVM8J5j4g.PNG/image.png?type=w966',
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const key = pathSegments.join('/');
    let remoteUrl = IMAGE_MAP[key];

    if (!remoteUrl) {
      // Check query parameter ?url=...
      const queryUrl = req.nextUrl.searchParams.get('url');
      if (queryUrl) {
        remoteUrl = decodeURIComponent(queryUrl);
      }
    }

    if (!remoteUrl && key.startsWith('proxy-')) {
      try {
        const encoded = key.replace(/^proxy-/, '').replace(/\.[a-z0-9]+$/i, '');
        remoteUrl = Buffer.from(encoded, 'base64url').toString('utf8');
      } catch {
        // ignore
      }
    }

    if (!remoteUrl) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const res = await fetch(remoteUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        Referer: 'https://blog.naver.com/',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      return new NextResponse(`Failed to fetch upstream image: ${res.status}`, {
        status: res.status,
      });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/png';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    return new NextResponse(`Server error: ${err.message}`, { status: 500 });
  }
}
