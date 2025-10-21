import CTA from '~/components/cta';
import FAQ from '~/components/faq';
import Hero from '~/components/hero';
import Footer from '~/components/footer';
import HowItWorks from '~/components/how-it-works';

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
