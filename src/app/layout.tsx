import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'IRON GYM — Strength training & coaching',
    template: '%s · IRON GYM',
  },
  description:
    'IRON GYM — serious strength training, expert coaching and flexible membership. Train heavy. Live strong.',
  applicationName: 'IRON GYM',
  keywords: ['gym', 'strength training', 'personal training', 'fitness', 'membership', 'IRON GYM', 'صالة رياضية', 'حديد', 'تدريب'],
  authors: [{ name: 'IRON GYM' }],
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
