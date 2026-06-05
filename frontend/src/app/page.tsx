import CTA from '~/components/cta';
import FAQ from '~/components/faq';
import Hero from '~/components/hero';
import Footer from '~/components/footer';
import type { Metadata } from 'next';
import { buildMetadata } from '~/lib/metadata';
import HowItWorks from '~/components/how-it-works';
import { EngagementTracker } from '~/components/analytics/engagement-tracker';

export const metadata: Metadata = buildMetadata({ path: '/' });

export default function Home() {
  return (
    <main className="w-full h-full flex flex-col">
      <EngagementTracker />
      <Hero />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
