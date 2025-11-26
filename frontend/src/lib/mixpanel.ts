import { env } from '~/env';
import mixpanel from 'mixpanel-browser';
import type { Session } from 'next-auth';

export const initMixpanel = (session: Session | null) => {
  if (!env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
    console.warn('Mixpanel token is missing! Check your .env file.');
    return;
  }

  mixpanel.init(env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    autocapture: true,
    record_sessions_percent: 100,
  });

  if (session?.user) {
    mixpanel.identify(session.user.id);
    mixpanel.people.set({
      $email: session.user.email,
      role: session.user.role,
    });
  } else {
    mixpanel.identify('Guest');
  }
};
