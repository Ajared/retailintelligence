import { z } from 'zod/v4';

export const addStoreFormSchema = z.object({
  name: z.string().min(1, 'Store name is required'),
  state_id: z.string().min(1, 'State is required'),
  local_government_id: z.string().min(1, 'Local government is required'),
  address: z.string().min(1, 'Address is required'),
  store_type: z.string().min(1, 'Store type is required'),
  landmarks: z.string().optional(),
  photos: z.array(z.string()).optional(),
  latitude: z.number(),
  longitude: z.number(),
  phase_id: z.string().optional(),
  district_id: z.string().optional(),
});

export type AddStoreFormData = z.infer<typeof addStoreFormSchema>;

export const editStoreFormSchema = addStoreFormSchema.extend({
  id: z.string().min(1, 'Store ID is required'),
});

export type EditStoreFormData = z.infer<typeof editStoreFormSchema>;
