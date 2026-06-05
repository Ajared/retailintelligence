'use client';

import { useEffect, useRef } from 'react';
import { sendGTMEvent } from '~/lib/analytics';

const ENGAGEMENT_DELAY_MS = 30_000;
const ENGAGEMENT_SCROLL_RATIO = 0.5;

export function EngagementTracker() {
  const firedRef = useRef(false);

  useEffect(() => {
    const fire = (trigger: 'time' | 'scroll') => {
      if (firedRef.current) return;
      firedRef.current = true;
      sendGTMEvent('engaged', { trigger });
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };

    const onScroll = () => {
      const scrolled =
        window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
      if (scrolled >= ENGAGEMENT_SCROLL_RATIO) fire('scroll');
    };

    const timer = window.setTimeout(() => fire('time'), ENGAGEMENT_DELAY_MS);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
