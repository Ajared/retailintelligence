import { Suspense } from 'react';
import type { Metadata } from 'next';
import Loader from '~/components/loader';
import { ForgotPasswordForm } from './form';

export const metadata: Metadata = {
  title: 'Reset Password',
  description:
    'Reset your Retailytics password to regain access to your retail intelligence dashboards and store data.',
  alternates: { canonical: '/forgot-password' },
  robots: { index: false, follow: true },
};

export default async function ForgotPasswordPage() {
  return (
    <div className="bg-background flex h-full w-full min-h-screen items-center justify-center p-4">
      <Suspense fallback={<Loader />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
