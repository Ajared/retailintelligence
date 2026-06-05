import { Suspense } from 'react';
import type { Metadata } from 'next';
import Loader from '~/components/loader';
import { ForgotPasswordForm } from './form';
import { buildMetadata } from '~/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Reset Password',
  description:
    'Reset your Retailytics password to regain access to your retail intelligence dashboards and store data.',
  path: '/forgot-password',
  index: false,
});

export default async function ForgotPasswordPage() {
  return (
    <div className="bg-background flex h-full w-full min-h-screen items-center justify-center p-4">
      <Suspense fallback={<Loader />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
