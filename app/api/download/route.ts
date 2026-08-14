import { NextRequest, NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

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

function ytId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|\/embed\/|\/v\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

// ── API 1 : cobalt.tools ────────────────────────────────────────────────────
async function tryCobalt(url: string): Promise<{ url: string; filename: string } | null> {
  try {
    const res = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ url, vCodec: 'h264', vQuality: '720', aFormat: 'mp3', isAudioOnly: false }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { status: string; url?: string; urls?: string };
    if (data.status === 'stream' || data.status === 'redirect') {
      const v = data.url || data.urls || '';
      if (v) return { url: v, filename: 'vidflix-video.mp4' };
    }
    return null;
  } catch { return null; }
}

// ── API 2 : tikwm.com (TikTok sans filigrane) ───────────────────────────────
async function tryTikwm(url: string): Promise<{ url: string; filename: string } | null> {
  try {
    const form = new URLSearchParams({ url, hd: '1' });
    const res = await fetch('https://www.tikwm.com/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { code: number; data?: { play?: string; hdplay?: string; title?: string } };
    if (data.code === 0 && data.data) {
      const videoUrl = data.data.hdplay || data.data.play || '';
      if (videoUrl) {
        const title = (data.data.title || 'tiktok-video').replace(/[^a-z0-9]/gi, '-').slice(0, 50);
        return { url: videoUrl, filename: `${title}.mp4` };
      }
    }
    return null;
  } catch { return null; }
}

// ── API 3 : snapinsta (Instagram) ───────────────────────────────────────────
async function trySnapInsta(url: string): Promise<{ url: string; filename: string } | null> {
  try {
    const form = new URLSearchParams({ url });
    const res = await fetch('https://snapinsta.app/action_download.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://snapinsta.app/',
      },
      body: form.toString(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const mp4Match = html.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/);
    if (mp4Match) return { url: mp4Match[1], filename: 'instagram-video.mp4' };
    return null;
  } catch { return null; }
}

// ── API 4 : YouTube oEmbed (confirm + redirect) ──────────────────────────────
async function tryYtOembed(videoId: string): Promise<{ url: string; filename: string; message: string } | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://youtu.be/${videoId}&format=json`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return {
      url: `https://www.youtube.com/watch?v=${videoId}`,
      filename: (data.title || 'youtube-video').replace(/[^a-z0-9]/gi, '-') + '.mp4',
      message: 'YouTube bloque le téléchargement direct. Ouvre la vidéo → maintiens le doigt → "Enregistrer".',
    };
  } catch { return null; }
}

// ── API 5 : Generic HEAD (direct video links) ────────────────────────────────
async function tryGenericHead(url: string): Promise<{ url: string; filename: string } | null> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) });
    const ct = res.headers.get('content-type') || '';
    if (ct.startsWith('video/') || ct.includes('octet-stream')) {
      return {
        url: res.url,
        filename: res.url.split('/').pop()?.split('?')[0] || 'video.mp4',
      };
    }
    return null;
  } catch { return null; }
}

// ── Main ─────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: { url?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS }); }

  const rawUrl = (body.url || '').trim();
  if (!rawUrl) return NextResponse.json({ error: 'URL requise' }, { status: 400, headers: CORS });

  let url = rawUrl;
  if (!url.startsWith('http')) url = 'https://' + url;
  try { new URL(url); } catch {
    return NextResponse.json({ error: 'URL invalide' }, { status: 400, headers: CORS });
  }

  const platform = detectPlatform(url);

  // TikTok → tikwm first (better no-watermark), then cobalt
  if (platform === 'tiktok') {
    const tikwm = await tryTikwm(url);
    if (tikwm) return NextResponse.json({ success: true, platform, ...tikwm, method: 'tikwm' }, { headers: CORS });
  }

  // Instagram → snapinsta first, then cobalt
  if (platform === 'instagram') {
    const snap = await trySnapInsta(url);
    if (snap) return NextResponse.json({ success: true, platform, ...snap, method: 'snapinsta' }, { headers: CORS });
  }

  // All platforms → cobalt
  const cobalt = await tryCobalt(url);
  if (cobalt) return NextResponse.json({ success: true, platform, ...cobalt, method: 'cobalt' }, { headers: CORS });

  // TikTok second try after cobalt
  if (platform === 'tiktok') {
    const tikwm2 = await tryTikwm(url);
    if (tikwm2) return NextResponse.json({ success: true, platform, ...tikwm2, method: 'tikwm-fallback' }, { headers: CORS });
  }

  // YouTube fallback
  if (platform === 'youtube') {
    const id = ytId(url);
    if (id) {
      const yt = await tryYtOembed(id);
      if (yt) return NextResponse.json({ success: true, platform, ...yt, method: 'yt-redirect' }, { headers: CORS });
    }
  }

  // Generic direct link
  const generic = await tryGenericHead(url);
  if (generic) return NextResponse.json({ success: true, platform, ...generic, method: 'direct' }, { headers: CORS });

  // Last resort fallback
  return NextResponse.json({
    success: true, platform,
    downloadUrl: url, filename: 'video.mp4', method: 'fallback',
    message: 'Vidéo protégée. Essaie depuis l\'app officielle → Copier le lien → Coller ici.',
  }, { headers: CORS });
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url param required' }, { status: 400, headers: CORS });
  return POST(new NextRequest(req.url, {
    method: 'POST',
    body: JSON.stringify({ url }),
    headers: { 'Content-Type': 'application/json' },
  }));
}
