import { auth } from '../auth';
import { LoginForm } from './form';
import type { Metadata } from 'next';
import { cache, Suspense } from 'react';
import Loader from '~/components/loader';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to your Retailytics account to access store enumeration dashboards, field data, and market intelligence reports.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: true },
};

const getSession = cache(() => auth());

export default async function LoginPage() {
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
        <LoginForm />
      </Suspense>
    </div>
  );
}
