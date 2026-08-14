import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { AgentationGuard } from '@/components/AgentationGuard';
import { HappySeedsWatermark } from '@/components/HappySeedsWatermark';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vidflix – Téléchargeur de vidéos',
  description: 'Téléchargez des vidéos depuis YouTube, TikTok, Instagram et plus en un clic. Fonctionne sur iPhone et Android.',
  applicationName: 'Vidflix',
  keywords: ['téléchargeur vidéo', 'video downloader', 'youtube download', 'tiktok download', 'instagram reels', 'vidmate'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vidflix',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/app-icon.png', sizes: '1024x1024', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Vidflix – Téléchargeur de vidéos',
    description: 'Téléchargez des vidéos depuis YouTube, TikTok, Instagram et plus en un clic.',
    images: [{ url: '/icon-512.png' }],
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#e50914',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* PWA meta */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Vidflix" />
        <link rel="apple-touch-icon" href="/app-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Google AdSense placeholder – add your publisher ID here */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script> */}

        {process.env.NODE_ENV === 'production' && (
          <Script
            async
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </head>
      <body className="antialiased bg-[#0a0a0f]">
        {children}
        <HappySeedsWatermark />
        <AgentationGuard />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
