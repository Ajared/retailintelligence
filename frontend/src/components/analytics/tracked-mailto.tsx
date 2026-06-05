'use client';

import type { ReactNode } from 'react';
import { sendGTMEvent } from '~/lib/analytics';

type TrackedMailtoProps = {
  email: string;
  location: string;
  className?: string;
  children: ReactNode;
};

export function TrackedMailto({
  email,
  location,
  className,
  children,
}: TrackedMailtoProps) {
  return (
    <a
      href={`mailto:${email}`}
      className={className}
      onClick={() =>
        sendGTMEvent('contact_click', {
          method: 'email',
          contact_location: location,
        })
      }
    >
      {children}
    </a>
  );
}
