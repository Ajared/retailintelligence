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
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 text-center cursor-pointer">
        <h1 className="text-3xl font-bold">Retail Intelligence</h1>
      </Link>
      <Suspense fallback={<Loader />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
