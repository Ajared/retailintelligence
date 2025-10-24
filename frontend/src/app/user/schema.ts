import { z } from 'zod/v4';

export const addStoreFormSchema = z
  .object({
    name: z.string().min(1, 'Store name is required'),
    state_id: z.string().min(1, 'State is required'),
    local_government_id: z.string().min(1, 'Local government is required'),
    address: z.string().min(1, 'Address is required'),
    store_type: z.string().min(1, 'Store type is required'),
    store_type_description: z
      .string()
      .max(500, 'Store type description must be 500 characters or less')
      .optional(),
    landmarks: z.string().optional(),
    photos: z.array(z.string()).optional(),
    latitude: z.number(),
    longitude: z.number(),
    phase_id: z.string().optional(),
    district_id: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        (data.store_type === 'SHOP' || data.store_type === 'OTHER') &&
        (!data.store_type_description ||
          data.store_type_description.trim() === '')
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        'Store type description is required when store type is SHOP or OTHER',
      path: ['store_type_description'],
    },
  );

export type AddStoreFormData = z.infer<typeof addStoreFormSchema>;

export const editStoreFormSchema = addStoreFormSchema.partial().extend({
  id: z.string().min(1, 'Store ID is required'),
});

export type EditStoreFormData = z.infer<typeof editStoreFormSchema>;
