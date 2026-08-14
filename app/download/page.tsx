'use client';

import { useState, useEffect, Suspense } from 'react';
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

function DownloadPageInner() {
  const params = useSearchParams();
  const platformParam = params.get('platform') || '';
  const meta = PLATFORM_LABELS[platformParam] || null;

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [error, setError] = useState('');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch {
      // clipboard not available, user types manually
    }
  };

  const handleDownload = async () => {
    const trimmed = url.trim();
    if (!trimmed) { setError('Colle un lien vidéo d\'abord.'); return; }
    setError('');
    setResult(null);
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
      } else {
        setError(data.error || 'Impossible d\'extraire la vidéo.');
      }
    } catch {
      setError('Erreur réseau. Vérifie ta connexion.');
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = (dlUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dlUrl;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
              onChange={e => { setUrl(e.target.value); setError(''); setResult(null); }}
              placeholder={meta?.placeholder || 'https://...'}
              className="flex-1 bg-[#1a1a24] border border-white/10 focus:border-[#e50914]/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors"
              onKeyDown={e => e.key === 'Enter' && handleDownload()}
              inputMode="url"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
            />
            <button
              onClick={handlePaste}
              className="px-3 py-3 bg-[#1a1a24] border border-white/10 hover:bg-[#222232] rounded-xl text-gray-400 hover:text-white transition-colors text-xs font-medium"
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
          disabled={loading}
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
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v13m0 0l-4-4m4 4l4-4" />
              </svg>
              Télécharger
            </>
          )}
        </button>

        {/* Result card */}
        {result && (
          <div className="bg-[#1a1a24] border border-green-500/20 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-green-400 font-semibold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vidéo trouvée !
            </div>
            {result.message && (
              <p className="text-xs text-yellow-400/80 leading-relaxed">{result.message}</p>
            )}
            <div className="text-xs text-gray-400 truncate">
              {result.filename}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => triggerDownload(result.downloadUrl, result.filename)}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 active:scale-95 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v13m0 0l-4-4m4 4l4-4" />
                </svg>
                Sauvegarder
              </button>
              <a
                href={result.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 bg-[#222232] hover:bg-[#2a2a3e] active:scale-95 rounded-xl text-sm text-gray-300 transition-all flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ouvrir
              </a>
            </div>
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

        {/* iOS Safari tip */}
        <div className="bg-[#1a1a24] border border-white/5 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-300 mb-1">💡 Sur iPhone (Safari)</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Appuie sur <strong className="text-gray-400">Ouvrir</strong>, puis maintiens le doigt appuyé sur la vidéo → <em>Enregistrer dans les photos</em>.
          </p>
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
