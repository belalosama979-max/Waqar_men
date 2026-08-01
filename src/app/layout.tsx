import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/Providers';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'نظام إدارة تسميع القرآن الكريم',
  description: 'نظام متكامل لإدارة وتتبع تسميع القرآن الكريم للطلاب مع لوحات قيادة متقدمة',
  manifest: '/manifest.json',
  keywords: ['قرآن', 'تسميع', 'إدارة', 'طلاب', 'معلم'],
  authors: [{ name: 'نظام تسميع القرآن' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'تسميع القرآن',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    title: 'نظام إدارة تسميع القرآن الكريم',
    description: 'نظام متكامل لإدارة وتتبع تسميع القرآن الكريم',
  },
};

export const viewport: Viewport = {
  themeColor: '#065f46',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${cairo.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
