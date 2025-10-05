import { z } from 'zod/v4';

const registerFormSchema = z
  .object({
    email: z.email(),
    inviteToken: z.string().optional(),
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

const forgotPasswordFormSchema = z.object({
  email: z.email(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;

const resetPasswordFormSchema = z
  .object({
    email: z.email(),
    password: z
      .string()
      .min(6, { error: 'Password must be at least 6 characters' }),
    confirmPassword: z
      .string()
      .min(6, { error: 'Password must be at least 6 characters' }),
    token: z.string().min(8, { error: 'Invalid OTP' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Invalid password. Passwords must be identical.',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

export {
  registerFormSchema,
  loginFormSchema,
  forgotPasswordFormSchema,
  resetPasswordFormSchema,
};
