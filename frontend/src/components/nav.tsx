import { Button } from './ui/button';
import type { Session } from 'next-auth';

export function Nav({ session }: { session: Session | null }) {
  return (
    <nav className="flex justify-between items-center mt-4 px-6 py-2 border rounded-full">
      Retailytics <Button>Get Started</Button>
    </nav>
  );
}
