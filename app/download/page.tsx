'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const PLATFORM_LABELS: Record<string, { name: string; placeholder: string; color: string }> = {
  youtube:   { name: 'YouTube',   placeholder: 'https://youtube.com/watch?v=...', color: 'text-red-400' },
  tiktok:    { name: 'TikTok',    placeholder: 'https://www.tiktok.com/@user/video/...', color: 'text-cyan-400' },
  instagram: { name: 'Instagram', placeholder: 'https://www.instagram.com/reel/...', color: 'text-pink-400' },
  twitter:   { name: 'X/Twitter', placeholder: 'https://x.com/user/status/...', color: 'text-sky-400' },
  facebook:  { name: 'Facebook',  placeholder: 'https://www.facebook.com/reel/...', color: 'text-blue-400' },
};

type DownloadResult = {
  success: boolean;
  platform: string;
  downloadUrl: string;
  filename: string;
  method: string;
  message?: string;
  error?: string;
};

/** Detect iOS */
function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Detect Android */
function isAndroid() {
  if (typeof navigator === 'undefined') return false;
  return /android/i.test(navigator.userAgent);
}

/**
 * Download a video directly to the device gallery/files.
 * Android: fetch as blob → create object URL → trigger <a download>
 * iOS: open in new tab (Safari can long-press save to Photos)
 */
async function saveToDevice(
  downloadUrl: string,
  filename: string,
  onProgress: (p: number) => void
): Promise<'saved' | 'opened' | 'idle'> {
  try {
    if (isAndroid()) {
      // Fetch via proxy to avoid CORS issues
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(downloadUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('fetch failed');

      const total = Number(res.headers.get('content-length') || 0);
      const reader = res.body?.getReader();
      if (!reader) throw new Error('no reader');

      const chunks: Uint8Array[] = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total > 0) onProgress(Math.round((received / total) * 100));
      }

      const blob = new Blob(chunks, { type: 'video/mp4' });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename || 'vidflix-video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
      return 'saved';
    } else {
      // iOS — open in new tab, user long-presses to save
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      return 'opened';
    }
  } catch {
    // Fallback: direct link
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || 'vidflix-video.mp4';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return 'opened';
  }
}

function DownloadPageInner() {
  const params = useSearchParams();
  const platformParam = params.get('platform') || '';
  const meta = PLATFORM_LABELS[platformParam] || null;

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'opened'>('idle');
  const ios = useRef(false);
  const android = useRef(false);

  useEffect(() => {
    ios.current = isIOS();
    android.current = isAndroid();
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) { setUrl(text); setError(''); setResult(null); setSaveStatus('idle'); }
    } catch {
      // not available
    }
  };

  const handleDownload = async () => {
    const trimmed = url.trim();
    if (!trimmed) { setError("Colle un lien vidéo d'abord."); return; }
    setError('');
    setResult(null);
    setSaveStatus('idle');
    setLoading(true);
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data: DownloadResult = await res.json();
      if (data.success && data.downloadUrl) {
        setResult(data);
        // Auto-trigger save immediately
        await handleSave(data);
      } else {
        setError(data.error || "Impossible d'extraire la vidéo.");
      }
    } catch {
      setError('Erreur réseau. Vérifie ta connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (r: DownloadResult) => {
    setSaving(true);
    setProgress(0);
    const status = await saveToDevice(r.downloadUrl, r.filename, setProgress);
    setSaving(false);
    setProgress(100);
    setSaveStatus(status);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Ad – top */}
      <div className="w-full bg-[#111118] border-b border-white/5 flex items-center justify-center py-2">
        <span className="text-xs text-gray-600 tracking-widest uppercase">Advertisement</span>
        <div id="adsense-download-top" className="hidden" />
      </div>

      {/* Header */}
      <header className="w-full max-w-2xl mx-auto px-4 pt-5 pb-2 flex items-center gap-3">
        <Link href="/" className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <img src="/app-icon.png" alt="Vidflix" className="w-8 h-8 rounded-xl" />
          <span className="text-xl font-extrabold">Vid<span className="text-[#e50914]">flix</span></span>
        </div>
        {meta && <span className={`text-sm font-semibold ml-auto ${meta.color}`}>{meta.name}</span>}
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <h1 className="text-2xl font-extrabold">
          {meta ? `Télécharger depuis ${meta.name}` : 'Télécharger une vidéo'}
        </h1>

        {/* URL input */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); setError(''); setResult(null); setSaveStatus('idle'); }}
              placeholder={meta?.placeholder || 'Colle le lien ici…'}
              className="flex-1 bg-[#1a1a24] border border-white/10 focus:border-[#e50914]/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors"
              onKeyDown={e => e.key === 'Enter' && handleDownload()}
              inputMode="url"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
            />
            <button
              onClick={handlePaste}
              className="px-3 py-3 bg-[#1a1a24] border border-white/10 hover:bg-[#222232] rounded-xl text-gray-400 hover:text-white transition-colors"
              title="Coller"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          </div>
          {error && <p className="text-red-400 text-xs px-1">{error}</p>}
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={loading || saving}
          className="w-full py-4 bg-gradient-to-r from-[#e50914] to-[#c2000e] hover:from-red-500 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Extraction en cours…
            </>
          ) : saving ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {progress > 0 ? `Téléchargement ${progress}%…` : 'Sauvegarde en cours…'}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v13m0 0l-4-4m4 4l4-4" />
              </svg>
              Télécharger &amp; Sauvegarder
            </>
          )}
        </button>

        {/* Progress bar */}
        {saving && progress > 0 && (
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#e50914] to-red-400 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Result / Save status */}
        {result && saveStatus === 'saved' && (
          <div className="bg-[#1a1a24] border border-green-500/30 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-green-400 font-bold text-sm">Vidéo sauvegardée ! ✅</p>
              <p className="text-gray-400 text-xs mt-0.5">Elle est dans tes fichiers / galerie.</p>
            </div>
          </div>
        )}

        {result && saveStatus === 'opened' && (
          <div className="bg-[#1a1a24] border border-yellow-500/30 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📱</span>
              </div>
              <div>
                <p className="text-yellow-400 font-bold text-sm">Vidéo ouverte dans Safari</p>
                <p className="text-gray-400 text-xs mt-0.5">Suis les étapes ci-dessous pour la sauvegarder :</p>
              </div>
            </div>
            {/* iPhone step-by-step */}
            <div className="flex flex-col gap-2 pl-1">
              {[
                { n: '1', t: 'La vidéo s\'est ouverte dans un nouvel onglet' },
                { n: '2', t: 'Maintiens le doigt appuyé sur la vidéo' },
                { n: '3', t: 'Appuie sur "Enregistrer dans les photos"' },
              ].map(s => (
                <div key={s.n} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#e50914]/20 text-[#e50914] text-[10px] font-bold flex items-center justify-center flex-shrink-0" translate="no">{s.n}</span>
                  <span className="text-xs text-gray-300">{s.t}</span>
                </div>
              ))}
            </div>
            {/* Retry save button */}
            <button
              onClick={() => result && handleSave(result)}
              className="w-full py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-xl text-yellow-300 text-sm font-semibold transition-all"
            >
              Réessayer l&apos;ouverture
            </button>
          </div>
        )}

        {/* Ad slot – mid */}
        <div className="w-full bg-[#111118] border border-white/5 rounded-2xl flex items-center justify-center py-4">
          <span className="text-xs text-gray-700 tracking-widest uppercase">Espace publicitaire · Google AdSense</span>
          <div id="adsense-download-mid" className="hidden" />
        </div>

        {/* Quick platform pills */}
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Changer de plateforme</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PLATFORM_LABELS).map(([key, p]) => (
              <Link
                key={key}
                href={`/download?platform=${key}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  platformParam === key
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-white/5 bg-[#1a1a24] text-gray-400 hover:text-white hover:border-white/15'
                }`}
              >
                {p.name}
              </Link>
            ))}
            <Link
              href="/download"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                !platformParam
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-white/5 bg-[#1a1a24] text-gray-400 hover:text-white hover:border-white/15'
              }`}
            >
              Autre
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="w-full max-w-2xl mx-auto border-t border-white/5 px-4 py-3 flex justify-around">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>
        <Link href="/download" className="flex flex-col items-center gap-0.5 text-red-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v13m0 0l-4-4m4 4l4-4" />
          </svg>
          <span className="text-[10px] font-medium">Télécharger</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <span className="text-[10px] font-medium">Recherche</span>
        </Link>
      </nav>

      {/* Ad – footer */}
      <div className="w-full bg-[#111118] border-t border-white/5 flex items-center justify-center py-2">
        <span className="text-xs text-gray-600 tracking-widest uppercase">Advertisement</span>
        <div id="adsense-download-footer" className="hidden" />
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Chargement…</div>}>
      <DownloadPageInner />
    </Suspense>
  );
}
