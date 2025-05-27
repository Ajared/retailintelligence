import { z } from 'zod/v4';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['local', 'test', 'development', 'staging', 'production'])
      .default('development'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
