import './globals.css';
import { env } from '~/env';
import Providers from './providers';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Loader from '~/components/loader';
import { Outfit } from 'next/font/google';
import { siteConfig } from '~/lib/site';
import { JsonLd } from '~/components/json-ld';
import { Toaster } from '~/components/ui/sonner';
import { siteGraph } from '~/lib/structured-data';
import { Analytics } from '@vercel/analytics/next';
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from '~/components/analytics/google-tag-manager';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.legalName, url: siteConfig.social.parent }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  alternates: {
    canonical: '/',
  },
  verification: env.GOOGLE_SITE_VERIFICATION
    ? { google: env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.twitter.handle,
    creator: siteConfig.twitter.handle,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
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
        <JsonLd data={siteGraph()} />
        <GoogleTagManager />
      </head>
      <body className={`${outfit.variable} antialiased`}>
        <GoogleTagManagerNoScript />
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
