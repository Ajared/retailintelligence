import { z } from 'zod/v4';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['local', 'test', 'development', 'staging', 'production'])
      .default('development'),
    API_URL: z.url(),
    AUTH_SECRET: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    UPLOADTHING_APP_ID: z.string(),
  },
  client: {
    NEXT_PUBLIC_MIXPANEL_TOKEN: z.string(),
    NEXT_PUBLIC_SITE_URL: z.url().default('https://retailytics.ajared.ng'),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: {
    NEXT_PUBLIC_MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
