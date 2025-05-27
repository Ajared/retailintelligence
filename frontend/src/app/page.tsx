import { redirect } from 'next/navigation';
import { auth, signOut } from './(auth)/auth';

export default async function Home() {
  const session = await auth();

  return (
    <div>
      <h1>Hello World</h1>
      {session && 'user' in session ? (
        <div>
          <p>
            Currently logged in as {session.user.email} with {session.user.role}{' '}
            role
          </p>
          <form
            action={async () => {
              'use server';
              await signOut();
            }}
          >
            <button type="submit">Sign Out</button>
          </form>
        </div>
      ) : (
        <form
          action={async () => {
            'use server';
            redirect('/login');
          }}
        >
          <button type="submit">Sign In</button>
        </form>
      )}
    </div>
  );
}
