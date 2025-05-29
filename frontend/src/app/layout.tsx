import {
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Source_Serif_4,
} from 'next/font/google';
import './globals.css';
import Providers from './providers';
import type { Metadata } from 'next';
import { Toaster } from '~/components/ui/sonner';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
});

const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  subsets: ['latin'],
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
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
    <html lang="en">
      <body
        className={`${jakarta.variable} ${sourceSerif.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
