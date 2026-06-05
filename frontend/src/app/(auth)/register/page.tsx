import { auth } from '../auth';
import { decodeJwt } from 'jose';
import type { Metadata } from 'next';
import { RegisterForm } from './form';
import { cache, Suspense } from 'react';
import Loader from '~/components/loader';
import { redirect } from 'next/navigation';
import { buildMetadata } from '~/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Create Account',
  description:
    'Create your Retailytics account to start collecting store data, validating field submissions, and turning local data into market intelligence.',
  path: '/register',
  index: false,
});

const getSession = cache(() => auth());

function validateInviteToken(inviteToken: string): {
  email: string;
  isValidToken: boolean;
} {
  let email = '';
  let isValidToken = true;

  try {
    if (inviteToken) {
      const decoded = decodeJwt(inviteToken);
      email = decoded.email as string;

      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        isValidToken = false;
      }
    } else {
      isValidToken = true;
    }
  } catch {
    isValidToken = false;
  }

  return { email, isValidToken };
}

async function RegisterFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ inviteToken?: string }>;
}) {
  const params = await searchParams;
  const inviteToken = params.inviteToken ?? '';

  const { email, isValidToken } = validateInviteToken(inviteToken);

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
  const session = await getSession();

  if (session?.user?.role) {
    if (session.user.role !== 'user') {
      redirect('/admin');
    } else {
      redirect('/user');
    }
  }

  return (
    <div className="bg-background flex h-full w-full min-h-screen items-center justify-center p-4">
      <Suspense fallback={<Loader />}>
        <RegisterFormWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
