'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [pwaInstallable, setPwaInstallable] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    // Capture PWA install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setPwaInstallable(false);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Ad slot – top banner */}
      <div className="w-full bg-[#111118] border-b border-white/5 flex items-center justify-center py-2 px-4" aria-label="Advertisement">
        <span className="text-xs text-gray-600 tracking-widest uppercase">Advertisement</span>
        <div id="adsense-top-banner" className="hidden" />
      </div>

      {/* Header */}
      <header className="w-full max-w-2xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/app-icon.png" alt="Vidflix" className="w-10 h-10 rounded-xl shadow-lg shadow-red-900/30" />
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Vid<span className="text-[#e50914]">flix</span>
          </span>
        </div>
        {pwaInstallable && (
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e50914] hover:bg-red-600 text-white text-xs font-semibold rounded-full transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v13m0 0l-4-4m4 4l4-4" />
            </svg>
            Installer
          </button>
        )}
      </header>

      {/* Hero */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2">
            Télécharge n&apos;importe<br />
            <span className="text-[#e50914]">quelle vidéo</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            YouTube · TikTok · Instagram · Twitter · Facebook · et plus
          </p>
        </div>

        {/* Quick platform buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/download?platform=youtube"
            className="flex items-center gap-3 p-4 bg-[#1a1a24] hover:bg-[#1f1f2e] active:scale-95 border border-white/5 rounded-2xl transition-all group"
          >
            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-600/15">
              <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.5 6.19a3.02 3.02 0 00-2.13-2.14C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.37.45A3.02 3.02 0 00.5 6.19C.06 8.07 0 12 0 12s.06 3.93.5 5.81a3.02 3.02 0 002.13 2.14C4.5 20.4 12 20.4 12 20.4s7.5 0 9.37-.45a3.02 3.02 0 002.13-2.14C23.94 15.93 24 12 24 12s-.06-3.93-.5-5.81zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z" />
              </svg>
            </span>
            <div>
              <div className="font-semibold text-sm text-white group-hover:text-red-400 transition-colors">YouTube</div>
              <div className="text-xs text-gray-500">Vidéos & Shorts</div>
            </div>
          </Link>

          <Link
            href="/download?platform=tiktok"
            className="flex items-center gap-3 p-4 bg-[#1a1a24] hover:bg-[#1f1f2e] active:scale-95 border border-white/5 rounded-2xl transition-all group"
          >
            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-cyan-600/15">
              <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z" />
              </svg>
            </span>
            <div>
              <div className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors">TikTok</div>
              <div className="text-xs text-gray-500">Sans filigrane</div>
            </div>
          </Link>

          <Link
            href="/download?platform=instagram"
            className="flex items-center gap-3 p-4 bg-[#1a1a24] hover:bg-[#1f1f2e] active:scale-95 border border-white/5 rounded-2xl transition-all group"
          >
            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-pink-600/15">
              <svg className="w-6 h-6 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </span>
            <div>
              <div className="font-semibold text-sm text-white group-hover:text-pink-400 transition-colors">Instagram</div>
              <div className="text-xs text-gray-500">Reels & Stories</div>
            </div>
          </Link>

          <Link
            href="/download?platform=twitter"
            className="flex items-center gap-3 p-4 bg-[#1a1a24] hover:bg-[#1f1f2e] active:scale-95 border border-white/5 rounded-2xl transition-all group"
          >
            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-600/15">
              <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </span>
            <div>
              <div className="font-semibold text-sm text-white group-hover:text-sky-400 transition-colors">X / Twitter</div>
              <div className="text-xs text-gray-500">Tweets vidéo</div>
            </div>
          </Link>
        </div>

        {/* Ad slot – between sections */}
        <div className="w-full bg-[#111118] border border-white/5 rounded-2xl flex items-center justify-center py-4" aria-label="Advertisement">
          <span className="text-xs text-gray-700 tracking-widest uppercase">Espace publicitaire · Google AdSense</span>
          <div id="adsense-mid" className="hidden" />
        </div>

        {/* Paste & Download CTA */}
        <Link
          href="/download"
          className="w-full flex items-center justify-center gap-3 p-5 bg-gradient-to-r from-[#e50914] to-[#c2000e] hover:from-red-500 hover:to-red-700 active:scale-95 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-red-900/30"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          Coller un lien &amp; Télécharger
        </Link>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '⚡', label: '1 clic' },
            { icon: '📱', label: 'iPhone & Android' },
            { icon: '🔒', label: 'Sans inscription' },
          ].map(f => (
            <div key={f.label} className="bg-[#1a1a24] border border-white/5 rounded-xl py-3 px-2">
              <div className="text-xl mb-1" translate="no">{f.icon}</div>
              <div className="text-xs text-gray-400 font-medium">{f.label}</div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-600 leading-relaxed">
          Vidflix est destiné à un usage personnel uniquement. Respectez les droits d&apos;auteur et les conditions d&apos;utilisation de chaque plateforme.
        </p>
      </main>

      {/* Bottom nav */}
      <nav className="w-full max-w-2xl mx-auto border-t border-white/5 px-4 py-3 flex justify-around">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-red-500">
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
        <Link href="/search" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <span className="text-[10px] font-medium">Recherche</span>
        </Link>
      </nav>

      {/* Ad slot – footer */}
      <div className="w-full bg-[#111118] border-t border-white/5 flex items-center justify-center py-2 px-4" aria-label="Advertisement">
        <span className="text-xs text-gray-600 tracking-widest uppercase">Advertisement</span>
        <div id="adsense-footer" className="hidden" />
      </div>
    </div>
  );
}
