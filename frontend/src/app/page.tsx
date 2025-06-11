import { auth } from './(auth)/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  if (session && 'user' in session) {
    if (session.user.role === 'user') {
      redirect('/user/stores');
    } else {
      redirect('/admin/users');
    }
  }

  redirect('/login');
}
