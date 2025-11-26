'use client';

import * as React from 'react';
import { ThemeProvider } from './theme';
import { initMixpanel } from '~/lib/mixpanel';
import { ProgressProvider } from '@bprogress/next/app';

const Providers = ({ children }: { children: React.ReactNode }) => {
  React.useEffect(() => {
    initMixpanel();
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
