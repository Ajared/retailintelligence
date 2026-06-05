import { env } from '~/env';

/**
 * Central, single-source-of-truth metadata for the Retailytics marketing
 * surface. Reused by page metadata, Open Graph/Twitter cards, robots.txt,
 * sitemap.xml, JSON-LD structured data and the llms.txt manifest so the
 * product is described consistently everywhere search engines and AI agents
 * look.
 */
export const siteConfig = {
  name: 'Retailytics',
  /** Parent organisation that builds and operates Retailytics. */
  legalName: 'Ajared Research Inc.',
  /** Canonical, absolute production URL (no trailing slash). */
  url: env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ''),
  tagline: 'Turn Local Data into Market Intelligence',
  description:
    'Retailytics turns local store data into market intelligence — enumeration, field data collection, and analysis in one platform. Start free today.',
  /** Monitored contact address used on public pages and structured data. */
  contactEmail: 'innovation@ajared.ca',
  /** Default social/OG share image (1200×630), served from /public. */
  ogImage: '/og.png',
  locale: 'en_US',
  twitter: {
    handle: '@ajaREDiA',
  },
  /** Profiles used for the Organization `sameAs` graph. */
  social: {
    twitter: 'https://twitter.com/ajaREDiA',
    github: 'https://github.com/ajared',
    parent: 'https://www.ajared.ng',
    parentCa: 'https://www.ajared.ca',
  },
  /** Keyword targets shared across pages. */
  keywords: [
    'retail intelligence',
    'store enumeration',
    'field data collection',
    'market intelligence',
    'retail analytics',
    'location intelligence',
    'market research',
    'store data platform',
  ],
} as const;

export type SiteConfig = typeof siteConfig;

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = '/'): string {
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}
