import { Cobe } from './cobe';
import { TrackedCta } from '~/components/analytics/tracked-cta';

export default function Hero() {
  return (
    <main className="relative flex flex-col gap-4">
      <main className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full h-full container mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 md:mt-32 lg:mt-40">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center leading-[1]">
          Turn Local Data into Market Intelligence
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-center max-w-3xl mx-auto px-4">
          Retailytics helps you gather, review, and understand relevant business
          data across certain locations for making better and well informed
          decisions.
        </p>
        <TrackedCta
          href="/register"
          event="cta_click"
          eventParams={{ cta_location: 'hero', destination: '/register' }}
          className="w-fit mx-auto text-sm sm:text-base"
        >
          Get Started
        </TrackedCta>
        <div className="w-full max-w-5xl mx-auto h-full">
          <Cobe />
        </div>
      </main>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </main>
  );
}
