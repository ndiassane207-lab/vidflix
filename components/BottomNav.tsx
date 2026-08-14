'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const path = usePathname();
  const items = [
    {
      href: '/', label: 'Accueil', match: '/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      href: '/download', label: 'Télécharger', match: '/download',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v13m0 0l-4-4m4 4l4-4" />
        </svg>
      ),
    },
    {
      href: '/shorts', label: 'Shorts', match: '/shorts',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      ),
    },
    {
      href: '/upload', label: 'Publier', match: '/upload',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v9m0-9l-4 4m4-4l4 4" />
        </svg>
      ),
    },
    {
      href: '/account', label: 'Compte', match: '/account',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="w-full max-w-2xl mx-auto border-t border-white/5 px-2 py-3 flex justify-around">
      {items.map(item => {
        const active = path === item.match || (item.match !== '/' && path.startsWith(item.match));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={"flex flex-col items-center gap-0.5 transition-colors min-w-0 " + (active ? 'text-red-500' : 'text-gray-500 hover:text-white')}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
