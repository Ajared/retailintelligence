'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import { Button } from '~/components/ui/button';
import { sendGTMEvent, type GTMEventParams } from '~/lib/analytics';

type TrackedCtaProps = {
  href: string;
  event: string;
  eventParams?: GTMEventParams;
  children: ReactNode;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

export function TrackedCta({
  href,
  event,
  eventParams,
  children,
  className,
  size,
}: TrackedCtaProps) {
  return (
    <Button asChild className={className} size={size}>
      <Link
        href={href as Route}
        onClick={() => sendGTMEvent(event, eventParams)}
      >
        {children}
      </Link>
    </Button>
  );
}
