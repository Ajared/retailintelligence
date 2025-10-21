import { cache } from 'react';
import { auth } from './(auth)/auth';
import Hero from '~/components/hero';
import { CTA } from '~/components/cta';
import { FAQ } from '~/components/faq';
import Footer from '~/components/footer';
import { HowItWorks } from '~/components/how-it-works';

const getSession = cache(() => auth());
export default async function Home() {
  const session = await getSession();

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
