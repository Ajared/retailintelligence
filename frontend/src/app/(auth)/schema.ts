import { z } from 'zod/v4';

const registerFormSchema = z.object({
  email: z.email(),
  inviteToken: z.jwt(),
  password: z.string().min(6),
});

const loginFormSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export { registerFormSchema, loginFormSchema };