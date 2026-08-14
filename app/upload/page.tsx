'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ shareUrl: string; title: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setError('');
    setResult(null);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) { setError('Choisis une vidéo d\'abord.'); return; }
    setError('');
    setUploading(true);
    setProgress(0);

    // Simulate progress while uploading
    const interval = setInterval(() => {
      setProgress(p => (p < 85 ? p + Math.random() * 8 : p));
    }, 400);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('title', title || file.name);
      form.append('description', description);

      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();

      clearInterval(interval);
      setProgress(100);

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Erreur lors de l\'upload.');
      }
    } catch {
      clearInterval(interval);
      setError('Erreur réseau. Vérifie ta connexion.');
    } finally {
      setUploading(false);
    }
  };

  const copyLink = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  const shareLink = () => {
    if (!result) return;
    if (navigator.share) {
      navigator.share({ title: result.title, url: result.shareUrl });
    }
  };

  const formatSize = (b: number) => b > 1024 * 1024
    ? `${(b / 1024 / 1024).toFixed(1)} Mo`
    : `${(b / 1024).toFixed(0)} Ko`;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Ad – top */}
      <div className="w-full bg-[#111118] border-b border-white/5 flex items-center justify-center py-2">
        <span className="text-xs text-gray-600 tracking-widest uppercase">Advertisement</span>
        <div id="adsense-upload-top" className="hidden" />
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
        <span className="ml-auto text-sm font-bold text-purple-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v9m0-9l-4 4m4-4l4 4" />
          </svg>
          Publier
        </span>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <h1 className="text-2xl font-extrabold">Publier une vidéo</h1>
        <p className="text-sm text-gray-400 -mt-3">Mets ta vidéo en ligne et partage le lien</p>

        {!result ? (
          <>
            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className={`w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center py-10 px-4 gap-3 ${
                file ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/10 bg-[#1a1a24] hover:border-white/20'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {file ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 flex items-center justify-center">
                    <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-white text-center truncate max-w-full">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null); setTitle(''); }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Changer de fichier
                  </button>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v9m0-9l-4 4m4-4l4 4" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-300">Appuie pour choisir une vidéo</p>
                  <p className="text-xs text-gray-600">MP4, MOV, WebM · Max 100 Mo</p>
                </>
              )}
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Titre</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Titre de ta vidéo"
                className="bg-[#1a1a24] border border-white/10 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Description (optionnel)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Décris ta vidéo…"
                rows={3}
                className="bg-[#1a1a24] border border-white/10 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors resize-none"
                maxLength={300}
              />
            </div>

            {error && <p className="text-red-400 text-xs px-1">{error}</p>}

            {/* Progress */}
            {uploading && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Upload en cours…</span>
                  <span translate="no">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Upload en cours…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v9m0-9l-4 4m4-4l4 4" />
                  </svg>
                  Publier la vidéo
                </>
              )}
            </button>
          </>
        ) : (
          /* Success */
          <div className="flex flex-col gap-4">
            <div className="bg-[#1a1a24] border border-green-500/30 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-green-500/15 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-400 font-bold">Vidéo publiée ! 🎉</p>
                  <p className="text-gray-400 text-xs mt-0.5">{result.title}</p>
                </div>
              </div>

              {/* Share link */}
              <div className="bg-[#0a0a0f] rounded-xl px-3 py-2.5 text-xs text-gray-300 break-all font-mono border border-white/5">
                {result.shareUrl}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    copied ? 'bg-green-600 text-white' : 'bg-[#222232] hover:bg-[#2a2a3e] text-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {copied ? 'Copié !' : 'Copier le lien'}
                </button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={shareLink}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Partager
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => { setFile(null); setTitle(''); setDescription(''); setResult(null); setProgress(0); }}
              className="w-full py-3 bg-[#1a1a24] hover:bg-[#222232] border border-white/5 rounded-2xl text-gray-300 text-sm font-medium transition-all"
            >
              Publier une autre vidéo
            </button>
          </div>
        )}

        {/* Ad mid */}
        <div className="w-full bg-[#111118] border border-white/5 rounded-2xl flex items-center justify-center py-3">
          <span className="text-xs text-gray-700 tracking-widest uppercase">Espace publicitaire</span>
          <div id="adsense-upload-mid" className="hidden" />
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
        <Link href="/shorts" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <span className="text-[10px] font-medium">Shorts</span>
        </Link>
        <Link href="/upload" className="flex flex-col items-center gap-0.5 text-purple-400">
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
        <div id="adsense-upload-footer" className="hidden" />
      </div>
    </div>
  );
}
