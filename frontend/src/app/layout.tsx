import './globals.css';
import { Suspense } from 'react';
import Providers from './providers';
import type { Metadata } from 'next';
import Loader from '~/components/loader';
import { Outfit } from 'next/font/google';
import { Toaster } from '~/components/ui/sonner';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Retail Intelligence',
  description: 'Retail Intelligence',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} antialiased`}>
        <Providers>
          <Suspense fallback={<Loader />}>{children}</Suspense>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
