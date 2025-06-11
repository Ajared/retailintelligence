import { cache } from 'react';
import { auth } from './(auth)/auth';
import { redirect } from 'next/navigation';

const getSession = cache(() => auth());
export default async function Home() {
  const session = await getSession();

  if (!session || !('user' in session)) {
    redirect('/login');
  }

  if (session.user.role === 'user') {
    redirect('/user/stores');
  }

  redirect('/admin/users');
}
