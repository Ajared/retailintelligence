import Link from 'next/link';
import { Suspense } from 'react';
import { decodeJwt } from 'jose';
import { RegisterForm } from './form';

async function RegisterFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ inviteToken?: string }>;
}) {
  const params = await searchParams;
  const inviteToken = params.inviteToken ?? '';

  let email = '';
  let isValidToken = true;

  try {
    if (inviteToken) {
      const decoded = decodeJwt(inviteToken);
      email = decoded.email as string;

      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        isValidToken = false;
      }
    }
  } catch {
    isValidToken = false;
  }

  return (
    <RegisterForm
      email={email}
      inviteToken={inviteToken}
      isValidToken={isValidToken}
    />
  );
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ inviteToken?: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 text-center cursor-pointer">
        <h1 className="text-3xl font-bold">Retail Intelligence</h1>
      </Link>
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterFormWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
