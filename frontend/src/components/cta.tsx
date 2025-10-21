import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-32">
      <div className="relative rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-background/50 to-accent/10 backdrop-blur-xl p-12 md:p-16 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/30 blur-[128px] animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/30 blur-[128px] animate-pulse-glow" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative text-center max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>

          <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-balance">
            Ready to unlock market insights?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Join businesses already using Retailytics to make smarter decisions
            about their market positioning and expansion strategies.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="text-base group shadow-lg shadow-primary/20"
              asChild
            >
              <Link href="https://retailintelligence.ajared.ng/">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            No credit card required • Free trial available
          </p>
        </div>
      </div>
    </section>
  );
}
