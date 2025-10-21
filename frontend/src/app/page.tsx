import { cache } from 'react';
import { auth } from './(auth)/auth';
import Hero from '~/components/hero';

const getSession = cache(() => auth());
export default async function Home() {
  const session = await getSession();
  console.log(session);
  return (
    <main className="w-full h-full">
      <Hero />
    </main>
  );
}
