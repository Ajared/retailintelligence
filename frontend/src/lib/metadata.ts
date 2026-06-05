import type { Metadata } from 'next';
import { siteConfig } from '~/lib/site';

type BuildMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  index?: boolean;
};

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = '/',
  index = true,
}: BuildMetadataOptions = {}): Metadata {
  const socialTitle = title
    ? `${title} · ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.tagline}`;

  return {
    title: title ?? { absolute: socialTitle },
    description,
    alternates: { canonical: path },
    ...(index ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url: path,
      title: socialTitle,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.twitter.handle,
      creator: siteConfig.twitter.handle,
      title: socialTitle,
      description,
    },
  };
}
