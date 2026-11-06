import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Hahmlet } from 'next/font/google';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './globals.css';
import { InkFilters } from '@/components/Stamp';

// 한글 글리프는 unicode-range 조각으로 필요한 것만 받는다(preload 끔).
const hahmlet = Hahmlet({ weight: '700', display: 'swap', preload: false, variable: '--font-hahmlet' });

const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const TITLE = '제주 서귀포 햇귤 10kg · 29,900원 | 귤상회';
const DESC = '노지 온주밀감 2S~M 혼합 · 무료배송';

export const metadata: Metadata = {
  metadataBase: new URL(prod ? `https://${prod}` : 'http://localhost:3000'),
  title: '제주 서귀포 햇귤 10kg | 귤상회',
  description: DESC,
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '귤상회',
    title: TITLE,
    description: DESC,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: '잎 달린 귤과 껍질을 벗긴 귤, 선별 태그' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={hahmlet.variable}>
      <body>
        <InkFilters />
        {children}
      </body>
    </html>
  );
}
