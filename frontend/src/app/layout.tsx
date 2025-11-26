import './globals.css';
import Providers from './providers';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Loader from '~/components/loader';
import { Outfit } from 'next/font/google';
import { Toaster } from '~/components/ui/sonner';
import { Analytics } from '@vercel/analytics/next';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Retailytics',
  description: 'Retailytics aka Retail Intelligence',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body className={`${outfit.variable} antialiased`}>
        <Suspense fallback={<Loader />}>
          <Providers>
            {children}
            <Toaster />
            <Analytics />
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
