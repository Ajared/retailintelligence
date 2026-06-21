import { absoluteUrl, siteConfig } from '~/lib/site';

const ORGANIZATION_ID = absoluteUrl('/#organization');
const WEBSITE_ID = absoluteUrl('/#website');
const SOFTWARE_ID = absoluteUrl('/#software');

type Faq = { question: string; answer: string };
type BreadcrumbItem = { name: string; path: string };

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: siteConfig.legalName,
    legalName: siteConfig.legalName,
    url: siteConfig.social.parent,
    description:
      'AI research and product studio building information systems and data products.',
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/opengraph-image'),
    },
    email: siteConfig.contactEmail,
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteConfig.contactEmail,
      contactType: 'customer support',
      availableLanguage: 'English',
    },
    location: [
      {
        '@type': 'Place',
        name: 'Toronto',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Toronto',
          addressRegion: 'ON',
          addressCountry: 'CA',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 43.6332,
          longitude: -79.4141,
        },
      },
      {
        '@type': 'Place',
        name: 'Abuja',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Abuja',
          addressCountry: 'NG',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 8.9976,
          longitude: 7.4674,
        },
      },
    ],
    parentOrganization: { '@id': 'https://ajared.ca/#organization' },
    sameAs: [
      siteConfig.social.parent,
      siteConfig.social.parentCa,
      'https://familytree.ajared.ng',
      siteConfig.social.twitter,
      siteConfig.social.github,
    ],
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: 'en',
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function softwareApplicationSchema() {
  return {
    '@type': 'SoftwareApplication',
    '@id': SOFTWARE_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    provider: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free trial — no credit card required.',
    },
    featureList: [
      'Assign enumerators to geographic areas',
      'Capture detailed retail store data in the field',
      'Real-time submission and quality-controlled validation',
      'Market analytics and reporting',
      'Location and market intelligence',
    ],
  };
}

export function faqPageSchema(faqs: ReadonlyArray<Faq>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: ReadonlyArray<BreadcrumbItem>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...items].map(
      (item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.path),
      }),
    ),
  };
}

export function siteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema(),
      websiteSchema(),
      softwareApplicationSchema(),
    ],
  };
}
