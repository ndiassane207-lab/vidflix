import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const videoUrl = req.nextUrl.searchParams.get('url');
  if (!videoUrl) {
    return new NextResponse('Missing url param', { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(videoUrl);
  } catch {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  // Only proxy http/https
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return new NextResponse('Protocol not allowed', { status: 400 });
  }

  try {
    const upstream = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Referer': parsedUrl.origin,
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!upstream.ok) {
      return new NextResponse(`Upstream error: ${upstream.status}`, { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'video/mp4';
    const contentLength = upstream.headers.get('content-length');

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': 'attachment; filename="vidflix-video.mp4"',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    };

    if (contentLength) headers['Content-Length'] = contentLength;

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch {
    return new NextResponse('Failed to fetch video', { status: 502 });
  }
}
