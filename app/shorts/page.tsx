'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/BottomNav';

type Video = { id: string; title: string; channel: string };
type Category = { label: string; videos: Video[] };

const CATEGORIES: Category[] = [
  {
    label: '🔥 Tendances',
    videos: [
      { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', channel: 'Rick Astley' },
      { id: '9bZkp7q19f0', title: 'Gangnam Style', channel: 'PSY' },
      { id: 'kJQP7kiw5Fk', title: 'Despacito', channel: 'Luis Fonsi' },
      { id: 'JGwWNGJdvx8', title: 'Shape of You', channel: 'Ed Sheeran' },
    ],
  },
  {
    label: '🎵 Musique',
    videos: [
      { id: 'RgKAFK5djSk', title: 'See You Again', channel: 'Wiz Khalifa' },
      { id: 'OPf0YbXqDm0', title: 'Mark Ronson - Uptown Funk', channel: 'Mark Ronson' },
      { id: 'hT_nvWreIhg', title: 'Counting Stars', channel: 'OneRepublic' },
      { id: 'YqeW9_5kURI', title: 'Dark Horse', channel: 'Katy Perry' },
      { id: '09R8_2nJtjg', title: 'Sugar', channel: 'Maroon 5' },
    ],
  },
  {
    label: '😂 Humour',
    videos: [
      { id: 'ZZ5LpwO-An4', title: 'HEYYEYAAEYAAAEYAEYAA', channel: 'He-Man' },
      { id: 'ub82Xb1C8os', title: 'The Duck Song', channel: 'Bryant Oden' },
      { id: 'e9SeJIgWRPk', title: 'Pen Pineapple Apple Pen', channel: 'PIKO-TARO' },
      { id: 'rSqmqn-ZF0g', title: 'Charlie Bit My Finger', channel: 'HDCYT' },
    ],
  },
  {
    label: '🌍 Voyage',
    videos: [
      { id: 'YNsOt0-XYBQ', title: 'Beautiful Destinations', channel: 'Beautiful Destinations' },
      { id: 'N4bFqW_eu2I', title: 'Paris 4K Walking Tour', channel: 'Travel Guide' },
      { id: 'tntOCGkgt98', title: 'Japan Travel 4K', channel: 'Discover Japan' },
      { id: '8ybW48rKBME', title: 'New York City Tour', channel: 'NYC Travel' },
    ],
  },
  {
    label: '🍳 Cuisine',
    videos: [
      { id: 'tRqsHbxEXMk', title: 'Gordon Ramsay Scrambled Eggs', channel: 'Gordon Ramsay' },
      { id: '9Fhx5YBzMCg', title: 'Perfect Pasta Carbonara', channel: 'Italia Squisita' },
      { id: 'FMzFPuTmOoM', title: 'Sushi at Home', channel: 'Joshua Weissman' },
      { id: 'dGiSBKKUHds', title: 'French Croissants Recipe', channel: 'Binging with Babish' },
    ],
  },
  {
    label: '💪 Sport',
    videos: [
      { id: 'RXSWbmcAkpg', title: 'Best NBA Dunks 2024', channel: 'NBA' },
      { id: 'n4xhEd9RKZE', title: 'Messi Best Goals', channel: 'FIFA' },
      { id: '3SiMRgRiMqg', title: 'Epic Gym Motivation', channel: 'Workout' },
      { id: 'xC3MnMNLLqo', title: 'Street Football Skills', channel: 'Freestyle Football' },
    ],
  },
  {
    label: '🎮 Gaming',
    videos: [
      { id: 'pDcwqYmJj8c', title: 'Minecraft World Record', channel: 'Dream' },
      { id: 'BSRoHLMIiHw', title: 'GTA 6 Trailer', channel: 'Rockstar Games' },
      { id: 'sEkSHqRjDNo', title: 'The Last of Us - Best Scenes', channel: 'PlayStation' },
      { id: 'e7CgdCTVl9E', title: 'Fortnite Chapter 5 Trailer', channel: 'Fortnite' },
    ],
  },
];

export default function ShortsPage() {
  const [activeCat, setActiveCat] = useState(0);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const category = CATEGORIES[activeCat];
  const filtered = search.trim()
    ? CATEGORIES.flatMap(c => c.videos).filter(v =>
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.channel.toLowerCase().includes(search.toLowerCase())
      )
    : category.videos;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center">
      {/* Ad slot – top */}
      <div className="w-full bg-[#111118] border-b border-white/5 flex items-center justify-center py-2">
        <span className="text-xs text-gray-600 tracking-widest uppercase">Advertisement</span>
      </div>

      {/* Header */}
      <header className="w-full max-w-2xl flex items-center gap-3 px-4 py-4 border-b border-white/5">
        <Link href="/">
          <img src="/app-icon.png" alt="Vidflix" className="w-8 h-8 rounded-lg" />
        </Link>
        <span className="font-bold text-lg tracking-tight">
          Vid<span className="text-[#e50914]">flix</span> Shorts
        </span>
      </header>

      {/* Search */}
      <div className="w-full max-w-2xl px-4 py-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="search"
            placeholder="Rechercher une vidéo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#111118] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"
          />
        </div>
      </div>

      {/* Category tabs */}
      {!search.trim() && (
        <div className="w-full max-w-2xl px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => { setActiveCat(i); setActiveVideo(null); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCat === i
                    ? 'bg-red-600 text-white'
                    : 'bg-[#1a1a24] text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-2xl px-4 pb-4 flex flex-col gap-3">
        {/* Video player */}
        {activeVideo && (
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-xl">
            <iframe
              key={activeVideo}
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Ad slot */}
        <div className="w-full bg-[#111118] border border-white/5 rounded-2xl flex items-center justify-center py-3">
          <span className="text-xs text-gray-700 tracking-widest uppercase">Publicité</span>
        </div>

        {/* Video list */}
        <div className="flex flex-col gap-2">
          {filtered.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              active={activeVideo === video.id}
              onWatch={() => setActiveVideo(video.id)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-8">Aucune vidéo trouvée.</p>
          )}
        </div>
      </main>

      {/* Bottom nav */}
      <BottomNav />

      <div className="w-full bg-[#111118] border-t border-white/5 flex items-center justify-center py-2">
        <span className="text-xs text-gray-600 tracking-widest uppercase">Advertisement</span>
      </div>
    </div>
  );
}

function VideoCard({ video, onWatch, active }: { video: Video; onWatch: () => void; active?: boolean }) {
  return (
    <button
      onClick={onWatch}
      className={"flex items-center gap-3 p-3 rounded-xl border transition-all text-left active:scale-95 w-full " + (active ? 'bg-[#e50914]/10 border-[#e50914]/30' : 'bg-[#1a1a24] border-white/5 hover:border-white/15')}
    >
      <div className="relative flex-shrink-0">
        <img
          src={"https://img.youtube.com/vi/" + video.id + "/mqdefault.jpg"}
          alt={video.title}
          className="w-20 h-12 object-cover rounded-lg"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-7 h-7 bg-black/70 rounded-full flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{video.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{video.channel}</p>
      </div>
      <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
