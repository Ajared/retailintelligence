'use client';

import * as React from 'react';
import { ThemeProvider } from './theme';
import type { Session } from 'next-auth';
import { initMixpanel } from '~/lib/mixpanel';
import { ProgressProvider } from '@bprogress/next/app';

const Providers = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) => {
  React.useEffect(() => {
    initMixpanel(session);
  }, []);

  return (
    <ProgressProvider
      height="3px"
      color="#34a85a"
      shallowRouting
      options={{ showSpinner: false }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </ProgressProvider>
  );
};

export default Providers;
