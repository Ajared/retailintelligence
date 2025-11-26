import * as React from 'react';
import { auth } from '~/app/(auth)/auth';
import ClientProviders from './client-providers';

const Providers = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  return <ClientProviders session={session}>{children}</ClientProviders>;
};

export default Providers;
