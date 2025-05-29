import Link from 'next/link';
import { Suspense } from 'react';
import { ForgotPasswordForm } from './form';

export default async function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 text-center cursor-pointer">
        <h1 className="text-3xl font-bold">Retail Intelligence</h1>
      </Link>
      <Suspense fallback={<div>Loading...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
