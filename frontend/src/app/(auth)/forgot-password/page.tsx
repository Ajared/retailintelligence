import Link from 'next/link';
import { Suspense } from 'react';
import Loader from '~/components/loader';
import { ForgotPasswordForm } from './form';

export default async function ForgotPasswordPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<Loader />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
