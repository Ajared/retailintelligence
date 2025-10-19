import { Suspense } from 'react';
import Loader from '~/components/loader';
import { ResetPasswordForm } from './form';

export default async function ResetPasswordPage() {
  return (
    <div className="bg-background flex h-full w-full min-h-screen items-center justify-center p-4">
      <Suspense fallback={<Loader />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
