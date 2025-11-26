import './globals.css';
import Providers from './providers';
import type { Metadata } from 'next';
import { Suspense, cache } from 'react';
import { auth } from '~/app/(auth)/auth';
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

const getSession = cache(() => auth());

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

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
        <Providers session={session}>
          <Suspense fallback={<Loader />}>{children}</Suspense>
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
