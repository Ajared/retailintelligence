import { z } from 'zod/v4';

const registerFormSchema = z
  .object({
    email: z.email(),
    inviteToken: z.jwt({ error: 'Invalid invite token' }),
    password: z
      .string()
      .min(6, { error: 'Password must be at least 6 characters' }),
    confirmPassword: z
      .string()
      .min(6, { error: 'Password must be at least 6 characters' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Invalid password. Passwords must be identical.',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerFormSchema>;

const loginFormSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(6, { error: 'Password must be at least 6 characters' }),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export { registerFormSchema, loginFormSchema };
