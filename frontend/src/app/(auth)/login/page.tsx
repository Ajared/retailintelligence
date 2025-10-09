import Link from 'next/link';
import { auth } from '../auth';
import { LoginForm } from './form';
import { cache, Suspense } from 'react';
import Loader from '~/components/loader';
import { redirect } from 'next/navigation';

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
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<Loader />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
