import './globals.css';
import Providers from './providers';
import type { Metadata } from 'next';
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
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
