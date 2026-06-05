import { env } from '~/env';

export const siteConfig = {
  name: 'Retailytics',
  legalName: 'Ajared Research Inc.',
  url: env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ''),
  tagline: 'Turn Local Data into Market Intelligence',
  description:
    'Retailytics turns local store data into market intelligence — enumeration, field data collection, and analysis in one platform. Start free today.',
  contactEmail: 'innovation@ajared.ca',
  locale: 'en_US',
  twitter: {
    handle: '@ajaREDiA',
  },
  social: {
    twitter: 'https://twitter.com/ajaREDiA',
    github: 'https://github.com/ajared',
    parent: 'https://www.ajared.ng',
    parentCa: 'https://www.ajared.ca',
  },
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

export const publicRoutes = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
] as const satisfies ReadonlyArray<{
  path: string;
  priority: number;
  changeFrequency:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
}>;

export function absoluteUrl(path = '/'): string {
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}
