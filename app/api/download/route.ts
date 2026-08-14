import { NextRequest, NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function detectPlatform(url: string): string {
  if (/youtu\.?be/i.test(url)) return 'youtube';
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  if (/instagram\.com/i.test(url)) return 'instagram';
  if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
  if (/facebook\.com|fb\.watch/i.test(url)) return 'facebook';
  if (/dailymotion\.com/i.test(url)) return 'dailymotion';
  if (/vimeo\.com/i.test(url)) return 'vimeo';
  return 'generic';
}

/** Extract YouTube video ID */
function ytId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|\/embed\/|\/v\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/** Try cobalt.tools public API – free, no auth required */
async function tryCobalt(url: string): Promise<{ url: string; filename: string } | null> {
  try {
    const res = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ url, vCodec: 'h264', vQuality: '720', aFormat: 'mp3', isAudioOnly: false }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { status: string; url?: string; urls?: string };
    if (data.status === 'stream' || data.status === 'redirect') {
      const videoUrl = data.url || data.urls || '';
      if (videoUrl) return { url: videoUrl, filename: 'vidflix-video.mp4' };
    }
    return null;
  } catch {
    return null;
  }
}

/** Try y2mate-style or rapidapi yt-dlp alternative (no API key fallback) */
async function tryYoutubeOembed(videoId: string): Promise<{ url: string; filename: string } | null> {
  // We can at least confirm the video exists and return the embed URL for playback
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://youtu.be/${videoId}&format=json`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string; thumbnail_url?: string };
    return {
      url: `https://www.youtube.com/watch?v=${videoId}`,
      filename: (data.title || 'youtube-video').replace(/[^a-z0-9]/gi, '-') + '.mp4',
    };
  } catch {
    return null;
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS });
  }

  const rawUrl = (body.url || '').trim();
  if (!rawUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: CORS });
  }

  let url = rawUrl;
  if (!url.startsWith('http')) url = 'https://' + url;

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400, headers: CORS });
  }

  const platform = detectPlatform(url);

  // 1. Try cobalt.tools for all platforms
  const cobalt = await tryCobalt(url);
  if (cobalt) {
    return NextResponse.json({
      success: true,
      platform,
      downloadUrl: cobalt.url,
      filename: cobalt.filename,
      method: 'cobalt',
    }, { headers: CORS });
  }

  // 2. For YouTube, confirm video via oembed and return direct watch link
  if (platform === 'youtube') {
    const id = ytId(url);
    if (id) {
      const yt = await tryYoutubeOembed(id);
      if (yt) {
        return NextResponse.json({
          success: true,
          platform: 'youtube',
          downloadUrl: yt.url,
          filename: yt.filename,
          method: 'redirect',
          message: 'Direct YouTube download requires a desktop app. Opening video — use browser "Save As" or the ⋮ menu.',
        }, { headers: CORS });
      }
    }
  }

  // 3. Generic: resolve redirects and return final URL
  try {
    const head = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });
    const ct = head.headers.get('content-type') || '';
    const finalUrl = head.url;
    const isVideo = ct.startsWith('video/') || ct.includes('octet-stream');
    if (isVideo) {
      return NextResponse.json({
        success: true,
        platform,
        downloadUrl: finalUrl,
        filename: finalUrl.split('/').pop()?.split('?')[0] || 'video.mp4',
        method: 'direct',
      }, { headers: CORS });
    }
  } catch {
    // ignore
  }

  // 4. Fallback: return original URL — let browser handle it
  return NextResponse.json({
    success: true,
    platform,
    downloadUrl: url,
    filename: 'video.mp4',
    method: 'fallback',
    message: 'Ouvrir le lien dans un navigateur compatible.',
  }, { headers: CORS });
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'URL param required' }, { status: 400, headers: CORS });
  }
  const fakeReq = new NextRequest(req.url, {
    method: 'POST',
    body: JSON.stringify({ url }),
    headers: { 'Content-Type': 'application/json' },
  });
  return POST(fakeReq);
}
