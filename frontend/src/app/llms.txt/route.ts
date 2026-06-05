import { absoluteUrl, siteConfig } from '~/lib/site';

const features = [
  'Assign enumerators to specific geographic areas',
  'Capture detailed retail store data in the field',
  'Real-time submission with quality-controlled validation',
  'Market analytics and reporting',
  'Location and market intelligence',
];

export function GET() {
  const body = `# ${siteConfig.name}

> ${siteConfig.description}

${siteConfig.name} is a retail intelligence platform built by ${siteConfig.legalName} — it helps teams assign enumerators to geographic areas, capture detailed retail store data in the field, validate submissions through quality control, and analyse the results to answer market questions.

## Core pages
- [Home](${absoluteUrl('/')}): Product overview, how it works, and FAQ.
- [How it works](${absoluteUrl('/#how-it-works')}): The four-step enumeration-to-insight workflow.
- [FAQ](${absoluteUrl('/#faq')}): Common questions about the platform and the data it collects.
- [Contact](${absoluteUrl('/contact')}): Reach the team for demos, partnerships, and support.

## Company
${siteConfig.name} is a product of ${siteConfig.legalName} (${siteConfig.social.parent}, ${siteConfig.social.parentCa}), an AI research and product studio that builds information systems and data products. Contact: ${siteConfig.contactEmail}.

## Key features
${features.map((feature) => `- ${feature}`).join('\n')}

## Legal
- [Privacy Policy](${absoluteUrl('/privacy')})
- [Terms of Service](${absoluteUrl('/terms')})
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
