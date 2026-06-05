import type { Metadata } from 'next';
import { siteConfig } from '~/lib/site';
import SitePage from '~/components/site-page';
import { buildMetadata } from '~/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description:
    'Get in touch with the Retailytics team at Ajared Research Inc. for demos, partnerships, support, and questions about retail intelligence.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <SitePage
      title="Contact us"
      description="Questions, demos, partnerships, or support — we'd love to hear from you."
    >
      <p>
        Retailytics is built and operated by {siteConfig.legalName}. The fastest
        way to reach us is by email, and we aim to respond within two business
        days.
      </p>

      <h2>Email</h2>
      <p>
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>
      </p>

      <h2>Sales &amp; demos</h2>
      <p>
        Want to see Retailytics in action for your market? Email us with a short
        note about your team and the regions you cover, and we&apos;ll set up a
        walkthrough.
      </p>

      <h2>Elsewhere</h2>
      <p>
        Learn more about the team at{' '}
        <a href={siteConfig.social.parent} target="_blank" rel="noreferrer">
          ajared.ng
        </a>{' '}
        and{' '}
        <a href={siteConfig.social.parentCa} target="_blank" rel="noreferrer">
          ajared.ca
        </a>
        .
      </p>
    </SitePage>
  );
}
