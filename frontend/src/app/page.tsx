import CTA from '~/components/cta';
import FAQ from '~/components/faq';
import Hero from '~/components/hero';
import type { Metadata } from 'next';
import { siteConfig } from '~/lib/site';
import Footer from '~/components/footer';
import HowItWorks from '~/components/how-it-works';

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — ${siteConfig.tagline}` },
  description: siteConfig.description,
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <main className="w-full h-full flex flex-col">
      <Hero />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
