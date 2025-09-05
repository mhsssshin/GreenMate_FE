import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import ConditionalNavbar from '@/components/ConditionalNavbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GreenMate - 건강한 걷기, 지속가능한 미래',
  description: '일상적인 이동을 의미있는 건강 활동으로 전환하는 도보 네비게이션 앱',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#00A67E',
  manifest: '/manifest.json',
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GreenMate" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <ConditionalNavbar />
          <main className="pt-16 pb-20">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
