'use client';

import { useState } from 'react';
import Link from 'next/link';

const SHORTS = [
  { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', platform: 'youtube' },
  { id: '9bZkp7q19f0', title: 'Gangnam Style', platform: 'youtube' },
  { id: 'kJQP7kiw5Fk', title: 'Despacito', platform: 'youtube' },
  { id: 'JGwWNGJdvx8', title: 'Shape of You', platform: 'youtube' },
  { id: 'RgKAFK5djSk', title: 'See You Again', platform: 'youtube' },
  { id: 'OPf0YbXqDm0', title: 'Uptown Funk', platform: 'youtube' },
];

export default function ShortsPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [embedId, setEmbedId] = useState<string | null>(null);

  function extractYtId(url: string): string | null {
    const m = url.match(/(?:v=|youtu\.be\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  const handleWatch = () => {
    const id = extractYtId(customUrl.trim());
    if (id) { setEmbedId(id); setActiveId(null); }
  };

  const currentId = activeId || embedId;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Ad – top */}
      <div className="w-full bg-[#111118] border-b border-white/5 flex items-center justify-center py-2">
        <span className="text-xs text-gray-600 tracking-widest uppercase">Advertisement</span>
        <div id="adsense-shorts-top" className="hidden" />
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
        <span className="ml-auto text-sm font-bold text-[#e50914] flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Shorts
        </span>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 flex flex-col gap-4">

        {/* Video Player */}
        {currentId && (
          <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${currentId}?autoplay=1&rel=0&modestbranding=1`}
              title="Vidflix Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              onClick={() => { setActiveId(null); setEmbedId(null); }}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Watch any video */}
        <div className="bg-[#1a1a24] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-200">▶ Regarder n&apos;importe quelle vidéo</p>
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleWatch()}
              placeholder="Colle un lien YouTube…"
              className="flex-1 bg-[#0a0a0f] border border-white/10 focus:border-[#e50914]/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
            />
            <button
              onClick={handleWatch}
              className="px-4 py-2.5 bg-[#e50914] hover:bg-red-600 active:scale-95 rounded-xl text-sm font-bold transition-all"
            >
              GO
            </button>
          </div>
          <p className="text-xs text-gray-600">Fonctionne avec YouTube, YouTube Shorts</p>
        </div>

        {/* Ad mid */}
        <div className="w-full bg-[#111118] border border-white/5 rounded-2xl flex items-center justify-center py-3">
          <span className="text-xs text-gray-700 tracking-widest uppercase">Espace publicitaire</span>
          <div id="adsense-shorts-mid" className="hidden" />
        </div>

        {/* Trending shorts */}
        <div>
          <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Tendances populaires</p>
          <div className="flex flex-col gap-2">
            {SHORTS.map(v => (
              <button
                key={v.id}
                onClick={() => { setActiveId(v.id); setEmbedId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left active:scale-95 ${
                  activeId === v.id
                    ? 'bg-[#e50914]/10 border-[#e50914]/30'
                    : 'bg-[#1a1a24] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                    alt={v.title}
                    className="w-20 h-12 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-7 h-7 bg-black/60 rounded-full flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{v.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">YouTube</p>
                </div>
                <Link
                  href={`/download?platform=youtube`}
                  onClick={e => e.stopPropagation()}
                  className="flex-shrink-0 p-2 bg-[#e50914]/10 hover:bg-[#e50914]/20 rounded-lg transition-colors"
                  title="Télécharger"
                >
                  <svg className="w-4 h-4 text-[#e50914]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v13m0 0l-4-4m4 4l4-4" />
                  </svg>
                </Link>
              </button>
            ))}
          </div>
        </div>

        {/* TikTok note */}
        <div className="bg-[#1a1a24] border border-cyan-500/20 rounded-2xl p-4">
          <p className="text-xs font-semibold text-cyan-400 mb-1">📱 TikTok</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            TikTok bloque l&apos;embed. Pour regarder une vidéo TikTok, ouvre-la dans l&apos;app TikTok → Copie le lien → Télécharge-la depuis l&apos;onglet <strong className="text-white">Télécharger</strong>.
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
        <Link href="/download" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v13m0 0l-4-4m4 4l4-4" />
          </svg>
          <span className="text-[10px] font-medium">Télécharger</span>
        </Link>
        <Link href="/shorts" className="flex flex-col items-center gap-0.5 text-red-500">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <span className="text-[10px] font-medium">Shorts</span>
        </Link>
        <Link href="/upload" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v9m0-9l-4 4m4-4l4 4" />
          </svg>
          <span className="text-[10px] font-medium">Publier</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <span className="text-[10px] font-medium">Recherche</span>
        </Link>
      </nav>

      <div className="w-full bg-[#111118] border-t border-white/5 flex items-center justify-center py-2">
        <span className="text-xs text-gray-600 tracking-widest uppercase">Advertisement</span>
        <div id="adsense-shorts-footer" className="hidden" />
      </div>
    </div>
  );
}
