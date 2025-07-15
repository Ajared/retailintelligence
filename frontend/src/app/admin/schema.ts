import { z } from 'zod/v4';

export const inviteUserFormSchema = z.object({
  email: z.email(),
  role: z.enum(['user', 'admin']),
});

export type InviteUserFormData = z.infer<typeof inviteUserFormSchema>;

export const assignLocationFormSchema = z.object({
  stateId: z.string().min(1, 'State is required'),
  localGovernmentId: z.string().min(1, 'Local Government is required'),
  phaseId: z.string().optional(),
  districtId: z.string().optional(),
  enumeratorId: z.string().min(1, 'Enumerator is required'),
});

export type AssignLocationFormData = z.infer<typeof assignLocationFormSchema>;
