import { env } from '~/env';
import mixpanel from 'mixpanel-browser';

export const initMixpanel = () => {
  if (!env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
    console.warn('Mixpanel token is missing! Check your .env file.');
    return;
  }

  mixpanel.init(env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    autocapture: true,
    record_sessions_percent: 100,
  });
};
