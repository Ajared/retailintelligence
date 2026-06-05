import type { Metadata } from 'next';
import { siteConfig } from '~/lib/site';
import SitePage from '~/components/site-page';
import { buildMetadata } from '~/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: `How ${siteConfig.legalName} collects, uses, and protects data on Retailytics.`,
  path: '/privacy',
  index: false,
});

export default function PrivacyPage() {
  return (
    <SitePage title="Privacy Policy" updated="June 2026">
      <p>
        This Privacy Policy explains how {siteConfig.legalName}
        (&quot;we&quot;, &quot;us&quot;) handles information in connection with
        the Retailytics platform. By using Retailytics you agree to the
        practices described here.
      </p>

      <h2>Information we collect</h2>
      <p>
        We collect account details you provide (such as name and email),
        operational data submitted through the platform (such as store and
        location records captured by enumerators), and standard technical data
        such as device and usage information.
      </p>

      <h2>How we use information</h2>
      <p>
        We use information to operate and improve the platform, validate and
        analyse submitted data, secure accounts, and communicate with you about
        the service.
      </p>

      <h2>Sharing</h2>
      <p>
        We do not sell personal information. We share data only with service
        providers who help us operate Retailytics, or where required by law.
      </p>

      <h2>Data retention &amp; security</h2>
      <p>
        We retain data for as long as needed to provide the service and meet
        legal obligations, and we apply appropriate safeguards to protect it.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions or data requests, contact{' '}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>
        .
      </p>
    </SitePage>
  );
}
