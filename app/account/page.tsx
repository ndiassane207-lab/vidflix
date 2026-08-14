'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/BottomNav';

type UserData = { email: string; name?: string };

export default function AccountPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setUser(data?.user ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleLogout() {
    setLogoutLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center">
      <header className="w-full max-w-2xl flex items-center gap-3 px-4 py-4 border-b border-white/5">
        <Link href="/">
          <img src="/app-icon.png" alt="Vidflix" className="w-8 h-8 rounded-lg" />
        </Link>
        <span className="font-bold text-lg tracking-tight">Mon Compte</span>
      </header>

      <main className="flex-1 w-full max-w-2xl px-4 py-8 flex flex-col gap-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : user ? (
          <>
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-3xl font-bold shadow-lg shadow-red-900/30">
                {initial}
              </div>
              <div className="text-center">
                {user.name && <p className="text-lg font-semibold">{user.name}</p>}
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Téléchargements', value: '—' },
                { label: 'Vidéos publiées', value: '—' },
                { label: 'Membre depuis', value: "Aujourd'hui" },
              ].map(s => (
                <div key={s.label} className="bg-[#111118] rounded-2xl border border-white/5 p-4 text-center">
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/download" className="flex items-center gap-3 px-4 py-3.5 bg-[#111118] rounded-2xl border border-white/5 hover:border-red-500/30 transition-colors">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v13m0 0l-4-4m4 4l4-4" />
                </svg>
                <span className="text-sm font-medium">Télécharger une vidéo</span>
                <svg className="w-4 h-4 text-gray-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/upload" className="flex items-center gap-3 px-4 py-3.5 bg-[#111118] rounded-2xl border border-white/5 hover:border-red-500/30 transition-colors">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v9m0-9l-4 4m4-4l4 4" />
                </svg>
                <span className="text-sm font-medium">Publier une vidéo</span>
                <svg className="w-4 h-4 text-gray-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="mt-2 flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {logoutLoading ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
              <span className="text-sm font-medium">Se déconnecter</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-6 py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-[#111118] border border-white/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Connexion requise</h2>
              <p className="text-gray-400 text-sm">Crée un compte gratuit pour accéder à toutes les fonctionnalités.</p>
            </div>
            <Link href="/login" className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-2xl transition-colors">
              Se connecter / S&apos;inscrire
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
              Continuer sans compte
            </Link>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
