'use client';

import { useState } from 'react';
import Link from 'next/link';

const SUGGESTED = [
  'YouTube Shorts',
  'TikTok viral',
  'Instagram Reels',
  'Musique MP3',
  'Tutoriel',
  'Films',
  'Clips musicaux',
  'Sport',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const handleSearch = (q: string) => {
    const term = q.trim();
    if (!term) return;
    // Redirect to download page with a YouTube search URL pre-filled
    const ytSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`;
    window.open(ytSearch, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Ad – top */}
      <div className="w-full bg-[#111118] border-b border-white/5 flex items-center justify-center py-2">
        <span className="text-xs text-gray-600 tracking-widest uppercase">Advertisement</span>
        <div id="adsense-search-top" className="hidden" />
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
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        <h1 className="text-2xl font-extrabold">Recherche</h1>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
              placeholder="Rechercher une vidéo…"
              className="w-full bg-[#1a1a24] border border-white/10 focus:border-[#e50914]/60 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors"
            />
          </div>
          <button
            onClick={() => handleSearch(query)}
            className="px-4 py-3 bg-[#e50914] hover:bg-red-600 active:scale-95 rounded-xl font-semibold text-sm transition-all"
          >
            OK
          </button>
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Recherches populaires</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map(s => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="px-3 py-1.5 bg-[#1a1a24] border border-white/5 hover:border-white/15 hover:bg-[#222232] rounded-full text-xs font-medium text-gray-300 transition-all active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-[#1a1a24] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-200">Comment ça marche ?</p>
          <div className="flex flex-col gap-2">
            {[
              { step: '1', text: 'Trouve la vidéo sur YouTube, TikTok, Instagram…' },
              { step: '2', text: 'Copie le lien depuis ton navigateur ou l\'app' },
              { step: '3', text: 'Colle-le dans l\'onglet Télécharger et clique !' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#e50914]/20 text-[#e50914] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5" translate="no">
                  {item.step}
                </span>
                <span className="text-sm text-gray-400">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ad slot – mid */}
        <div className="w-full bg-[#111118] border border-white/5 rounded-2xl flex items-center justify-center py-4">
          <span className="text-xs text-gray-700 tracking-widest uppercase">Espace publicitaire · Google AdSense</span>
          <div id="adsense-search-mid" className="hidden" />
        </div>

        {/* CTA */}
        <Link
          href="/download"
          className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[#e50914] to-[#c2000e] hover:from-red-500 hover:to-red-700 active:scale-95 rounded-2xl font-bold text-base transition-all shadow-lg shadow-red-900/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v13m0 0l-4-4m4 4l4-4" />
          </svg>
          Télécharger maintenant
        </Link>
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
        <Link href="/search" className="flex flex-col items-center gap-0.5 text-red-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <span className="text-[10px] font-medium">Recherche</span>
        </Link>
      </nav>

      {/* Ad – footer */}
      <div className="w-full bg-[#111118] border-t border-white/5 flex items-center justify-center py-2">
        <span className="text-xs text-gray-600 tracking-widest uppercase">Advertisement</span>
        <div id="adsense-search-footer" className="hidden" />
      </div>
    </div>
  );
}
