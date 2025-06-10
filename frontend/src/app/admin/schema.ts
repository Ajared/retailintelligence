import { z } from 'zod/v4';

export const inviteUserFormSchema = z.object({
  email: z.email(),
  role: z.enum(['user', 'admin']),
});

export type InviteUserFormData = z.infer<typeof inviteUserFormSchema>;
