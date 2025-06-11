import { auth } from './(auth)/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  if (!session || !('user' in session)) {
    redirect('/login');
  }

  if (session.user.role === 'user') {
    redirect('/user/stores');
  }

  redirect('/admin/users');
}
