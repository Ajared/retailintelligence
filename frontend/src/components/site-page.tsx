import Link from 'next/link';
import type { ReactNode } from 'react';
import Footer from '~/components/footer';
import { siteConfig } from '~/lib/site';
import { Button } from '~/components/ui/button';

type SitePageProps = {
  title: string;
  description?: string;
  updated?: string;
  children: ReactNode;
};

export default function SitePage({
  title,
  description,
  updated,
  children,
}: SitePageProps) {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="container mx-auto flex items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <Button size="sm" asChild>
          <Link href="/register">Get Started</Link>
        </Button>
      </header>

      <section className="container mx-auto flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-muted-foreground">{description}</p>
            )}
            {updated && (
              <p className="text-sm text-muted-foreground">
                Last updated {updated}
              </p>
            )}
          </div>
          <div className="space-y-6 text-muted-foreground leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
            {children}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
