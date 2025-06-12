'use client';

import { env } from '~/env';
import posthog from 'posthog-js';

posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: '/ingest',
  ui_host: env.NEXT_PUBLIC_POSTHOG_HOST,
  capture_pageview: 'history_change',
  autocapture: true,
  capture_pageleave: true,
  capture_exceptions: true,
  debug: env.NEXT_PUBLIC_NODE_ENV === 'development',
});
