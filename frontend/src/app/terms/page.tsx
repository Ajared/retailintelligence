import type { Metadata } from 'next';
import { siteConfig } from '~/lib/site';
import SitePage from '~/components/site-page';
import { buildMetadata } from '~/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service',
  description: `The terms governing use of the Retailytics platform from ${siteConfig.legalName}.`,
  path: '/terms',
  index: false,
});

export default function TermsPage() {
  return (
    <SitePage title="Terms of Service" updated="June 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of the Retailytics platform provided by {siteConfig.legalName}
        (&quot;we&quot;, &quot;us&quot;). By creating an account or using the
        service, you agree to these Terms.
      </p>

      <h2>Use of the service</h2>
      <p>
        You may use Retailytics only in compliance with these Terms and
        applicable law. You are responsible for activity under your account and
        for keeping your credentials secure.
      </p>

      <h2>Data and content</h2>
      <p>
        You retain rights to the data you submit. You grant us the rights needed
        to host, process, and analyse that data to provide the service.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree not to misuse the service, attempt to disrupt it, or use it to
        collect data unlawfully or without proper authorisation.
      </p>

      <h2>Availability &amp; disclaimer</h2>
      <p>
        The service is provided on an &quot;as is&quot; basis. We do not warrant
        that it will be uninterrupted or error-free, and we are not liable for
        indirect or consequential damages to the extent permitted by law.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? Contact{' '}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>
        .
      </p>
    </SitePage>
  );
}
