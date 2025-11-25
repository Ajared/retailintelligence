'use server';

import { z } from 'zod/v4';
import customFetch from '~/lib/custom-fetch';
import { StoreInterface } from '~/types/store';
import { collectErrorMessages } from '~/lib/utils';
import { UserInterface, UserRole } from '~/types/user';
import type {
  Response,
  ErrorResponse,
  PaginatedSuccessResponse,
} from '~/types/actions';
import { InviteUserFormData, inviteUserFormSchema } from './schema';
import {
  AddStoreFormData,
  addStoreFormSchema,
  EditStoreFormData,
  editStoreFormSchema,
} from '../user/schema';
import { utapi } from '~/lib/uploadthing';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { redirect } from 'next/navigation';

export const getAllStores = async (
  page: number = 1,
  limit: number = 20,
  sort: string = 'ASC',
  stateId?: string,
  localGovernmentId?: string,
  enumeratorId?: string,
  name?: string,
  storeType?: string,
): Promise<Response<StoreInterface[]>> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });

    if (stateId) queryParams.append('stateId', stateId);
    if (localGovernmentId)
      queryParams.append('localGovernmentId', localGovernmentId);
    if (enumeratorId) queryParams.append('enumeratorId', enumeratorId);
    if (name && name.trim().length > 0) queryParams.append('name', name.trim());
    if (storeType && storeType.trim().length > 0)
      queryParams.append('storeType', storeType.trim());

    const response = await customFetch.get<StoreInterface[]>(
      `/admin/stores?${queryParams.toString()}`,
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const getStoreById = async (
  storeId: string,
): Promise<Response<StoreInterface>> => {
  try {
    const response = await customFetch.get<StoreInterface>(
      `/admin/stores/${storeId}`,
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const getAllUsers = async (
  page: number = 1,
  limit: number = 20,
  sort: string = 'ASC',
  role?: string,
  status?: string,
): Promise<Response<UserInterface[]>> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });

    if (role) queryParams.append('role', role);
    if (status) queryParams.append('status', status);

    const response = await customFetch.get<UserInterface[]>(
      `/admin/users?${queryParams.toString()}`,
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const deactivateUser = async (
  userId: string,
): Promise<Response<UserInterface>> => {
  try {
    const response = await customFetch.post<UserInterface>(
      `/admin/users/${userId}/deactivate`,
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const reactivateUser = async (
  userId: string,
): Promise<Response<UserInterface>> => {
  try {
    const response = await customFetch.post<UserInterface>(
      `/admin/users/${userId}/reactivate`,
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const deleteUser = async (
  userId: string,
): Promise<Response<UserInterface>> => {
  try {
    const response = await customFetch.delete<UserInterface>(
      `/admin/users/${userId}`,
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const updateUserRole = async (
  userId: string,
  role: UserRole,
): Promise<Response<UserInterface>> => {
  try {
    const response = await customFetch.post<UserInterface>(
      `/admin/users/${userId}/role`,
      { role },
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const verifyUser = async (
  userId: string,
): Promise<Response<UserInterface>> => {
  try {
    const response = await customFetch.post<UserInterface>(
      `/admin/users/${userId}/verify`,
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const bulkVerifyUsers = async (
  userIds: string[],
): Promise<Response<UserInterface[]>> => {
  try {
    const response = await customFetch.post<UserInterface[]>(
      '/admin/users/bulk-approve',
      { userIds },
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const inviteUser = async (
  _: Response<{ email: string } | null>,
  formData: FormData,
) => {
  let rawData: InviteUserFormData | null = null;

  try {
    rawData = {
      email: formData.get('email') as string,
      role: formData.get('role') as 'user' | 'admin',
    };

    const validatedData = inviteUserFormSchema.safeParse(rawData);

    if (!validatedData.success) {
      const messages = collectErrorMessages(
        z.treeifyError(validatedData.error),
      );

      return {
        inputs: rawData,
        message: 'Invalid form data',
        timestamp: new Date().toISOString(),
        error: messages,
      } as ErrorResponse & { inputs: InviteUserFormData };
    }

    const { email, role } = validatedData.data;

    const response = await customFetch.post<{ email: string }>('/auth/invite', {
      email,
      role,
    });

    if (!('data' in response)) {
      return {
        ...response,
        inputs: rawData,
      } as ErrorResponse & { inputs: InviteUserFormData };
    }

    return response;
  } catch (error) {
    return {
      inputs: rawData,
      message: 'Something went wrong',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Something went wrong',
    } as ErrorResponse & { inputs: InviteUserFormData };
  }
};

export const assignLocation = async (params: {
  stateId: string;
  localGovernmentId: string;
  phaseId: string | undefined;
  districtId: string | undefined;
  enumeratorId: string;
}) => {
  try {
    const { stateId, localGovernmentId, phaseId, districtId, enumeratorId } =
      params;
    const response = await customFetch.post<StoreInterface>(
      `/admin/users/${enumeratorId}/assign-location`,
      {
        stateId,
        localGovernmentId,
        phaseId,
        districtId,
      },
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const getAdminMapData = async (
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  opts: {
    page?: number;
    limit?: number;
    sort?: 'ASC' | 'DESC';
    name?: string;
    storeType?: string;
  } = {},
): Promise<Response<StoreInterface[]>> => {
  try {
    const { page = 1, limit = 20, sort = 'ASC' } = opts;
    const allData: StoreInterface[] = [];
    let currentPage = page;
    let hasNext = true;
    let compiledResponse: PaginatedSuccessResponse<StoreInterface[]> | null =
      null;
    const MAX_PAGES = 50;

    while (hasNext && currentPage <= MAX_PAGES) {
      const params = new URLSearchParams({
        minLat: String(bounds.minLat),
        maxLat: String(bounds.maxLat),
        minLng: String(bounds.minLng),
        maxLng: String(bounds.maxLng),
        page: String(currentPage),
        limit: String(limit),
        sort,
      });
      if (opts.name && opts.name.trim().length > 0) {
        params.append('name', opts.name.trim());
      }
      if (opts.storeType && opts.storeType.trim().length > 0) {
        params.append('storeType', opts.storeType.trim());
      }
      const response = await customFetch.get<StoreInterface[]>(
        `/admin/stores?${params.toString()}`,
      );

      if (!('data' in response)) {
        throw new Error(response.message);
      }

      allData.push(...response.data);

      compiledResponse = response;
      if (!response.meta || typeof response.meta.has_next !== 'boolean') {
        throw new Error('Invalid pagination metadata');
      }
      hasNext = response.meta.has_next;
      currentPage++;
    }

    if (!compiledResponse) {
      throw new Error('No data fetched');
    }

    return {
      ...compiledResponse,
      data: allData,
      meta: {
        ...compiledResponse.meta,
        has_next: false,
        total: allData.length,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const addStore = async (
  _: Response<StoreInterface | null>,
  formData: FormData,
) => {
  let rawData: AddStoreFormData | null = null;

  try {
    const getStringValue = (key: string): string => {
      const value = formData.get(key);
      return value ? String(value) : '';
    };

    const getNumberValue = (key: string): number => {
      const value = formData.get(key);
      if (!value) return 0;
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Invalid number value for ${key}: ${value}`);
      }
      return num;
    };

    rawData = {
      name: getStringValue('name'),
      state_id: getStringValue('state_id'),
      local_government_id: getStringValue('local_government_id'),
      phase_id: getStringValue('phase_id'),
      district_id: getStringValue('district_id'),
      address: getStringValue('address'),
      store_type: getStringValue('store_type'),
      store_type_description: getStringValue('store_type_description'),
      latitude: getNumberValue('latitude'),
      longitude: getNumberValue('longitude'),
      landmarks: getStringValue('landmarks'),
      photos: [],
    };

    const validatedData = addStoreFormSchema
      .omit({ photos: true })
      .safeParse(rawData);

    if (!validatedData.success) {
      const messages = collectErrorMessages(
        z.treeifyError(validatedData.error),
      );

      return {
        inputs: rawData,
        message: 'Invalid form data',
        timestamp: new Date().toISOString(),
        error: messages,
      } as ErrorResponse & { inputs: AddStoreFormData };
    }

    let uploadedPhotoUrls: string[] = [];
    const photoFiles = formData.getAll('photos') as File[];
    const validPhotoFiles = photoFiles.filter((file) => file.size > 0);

    if (validPhotoFiles.length > 0) {
      try {
        const uploadResults = await utapi.uploadFiles(validPhotoFiles, {
          concurrency: validPhotoFiles.length,
        });

        uploadedPhotoUrls = uploadResults
          .filter((result) => result.data !== null)
          .map((result) => result.data!.ufsUrl);
      } catch {
        return {
          inputs: rawData,
          message: 'Failed to upload photos. Please try again.',
          timestamp: new Date().toISOString(),
          error: 'Photo upload failed',
        };
      }
    }

    rawData.photos = uploadedPhotoUrls;
    const finalValidation = addStoreFormSchema.safeParse(rawData);

    if (!finalValidation.success) {
      const messages = collectErrorMessages(
        z.treeifyError(finalValidation.error),
      );
      return {
        inputs: rawData,
        message: 'Invalid form data after photo upload',
        timestamp: new Date().toISOString(),
        error: messages,
      };
    }

    const response = await customFetch.post<StoreInterface>('/stores', {
      name: rawData.name,
      stateId: rawData.state_id,
      localGovernmentId: rawData.local_government_id,
      address: rawData.address,
      storeType: rawData.store_type,
      storeTypeDescription: rawData.store_type_description,
      latitude: rawData.latitude,
      longitude: rawData.longitude,
      landmarks: rawData.landmarks,
      photos: uploadedPhotoUrls,
      ...(rawData.phase_id && { phaseId: rawData.phase_id }),
      ...(rawData.district_id && { districtId: rawData.district_id }),
    });

    if (!('data' in response)) {
      if (uploadedPhotoUrls.length > 0) {
        try {
          const fileIds = uploadedPhotoUrls
            .map((url) => {
              try {
                const urlObj = new URL(url);
                const pathname = urlObj.pathname.replace(/\/$/, '');
                const segments = pathname.split('/');
                return segments[segments.length - 1];
              } catch {
                return null;
              }
            })
            .filter((id): id is string => id !== null);

          if (fileIds.length > 0) {
            await utapi.deleteFiles(fileIds);
          }
        } catch {
          return {
            ...response,
            inputs: rawData,
          } as ErrorResponse & { inputs: AddStoreFormData };
        }
      }

      return {
        ...response,
        inputs: rawData,
      } as ErrorResponse & { inputs: AddStoreFormData };
    }

    redirect('/admin/locations');
  } catch (error) {
    if (isRedirectError(error)) throw error;

    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      inputs: rawData,
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse & { inputs: AddStoreFormData };
  }
};

export const editStore = async (
  _: Response<StoreInterface | null>,
  formData: FormData,
) => {
  let rawData: EditStoreFormData | null = null;

  try {
    const getOptionalString = (key: string): string | undefined => {
      const val = formData.get(key);
      if (!val) return undefined;
      const s = String(val).trim();
      return s.length > 0 ? s : undefined;
    };
    const getRequiredString = (key: string): string => {
      const val = formData.get(key);
      if (!val) return '';
      return String(val);
    };
    const getOptionalNumber = (key: string): number | undefined => {
      const val = formData.get(key);
      if (!val) return undefined;
      const s = String(val).trim();
      if (s.length === 0) return undefined;
      const n = Number(s);
      return Number.isNaN(n) ? undefined : n;
    };

    rawData = {
      id: getRequiredString('id'),
      name: getOptionalString('name'),
      state_id: getOptionalString('state_id'),
      local_government_id: getOptionalString('local_government_id'),
      phase_id: getOptionalString('phase_id'),
      district_id: getOptionalString('district_id'),
      address: getOptionalString('address'),
      store_type: getOptionalString('store_type'),
      store_type_description: getOptionalString('store_type_description'),
      latitude: getOptionalNumber('latitude'),
      longitude: getOptionalNumber('longitude'),
      landmarks: getOptionalString('landmarks'),
      photos: [],
    };

    const validatedData = editStoreFormSchema
      .omit({ photos: true })
      .safeParse(rawData);

    if (!validatedData.success) {
      const messages = collectErrorMessages(
        z.treeifyError(validatedData.error),
      );

      return {
        inputs: rawData,
        message: 'Invalid form data',
        timestamp: new Date().toISOString(),
        error: messages,
      } as ErrorResponse & { inputs: EditStoreFormData };
    }

    const existingPhotoUrls = (
      formData.getAll('existing_photos') as string[]
    ).filter(Boolean);
    let uploadedPhotoUrls: string[] = [];
    const photoFiles = formData.getAll('photos') as File[];
    const validPhotoFiles = photoFiles.filter((file) => file.size > 0);

    if (validPhotoFiles.length > 0) {
      try {
        const uploadResults = await utapi.uploadFiles(validPhotoFiles, {
          concurrency: validPhotoFiles.length,
        });

        uploadedPhotoUrls = uploadResults
          .filter((result) => result.data !== null)
          .map((result) => result.data!.ufsUrl);
      } catch {
        return {
          inputs: rawData,
          message: 'Failed to upload photos. Please try again.',
          timestamp: new Date().toISOString(),
          error: 'Photo upload failed',
        };
      }
    }

    rawData.photos = [...existingPhotoUrls, ...uploadedPhotoUrls];
    const finalValidation = editStoreFormSchema.safeParse(rawData);

    if (!finalValidation.success) {
      const messages = collectErrorMessages(
        z.treeifyError(finalValidation.error),
      );
      return {
        inputs: rawData,
        message: 'Invalid form data after photo upload',
        timestamp: new Date().toISOString(),
        error: messages,
      };
    }

    const response = await customFetch.patch<StoreInterface>(
      `/stores/${rawData.id}`,
      {
        name: rawData.name,
        stateId: rawData.state_id,
        localGovernmentId: rawData.local_government_id,
        address: rawData.address,
        storeType: rawData.store_type,
        storeTypeDescription: rawData.store_type_description,
        latitude: rawData.latitude,
        longitude: rawData.longitude,
        landmarks: rawData.landmarks,
        photos: rawData.photos,
        ...(rawData.phase_id && { phaseId: rawData.phase_id }),
        ...(rawData.district_id && { districtId: rawData.district_id }),
      },
    );

    if (!('data' in response)) {
      if (uploadedPhotoUrls.length > 0) {
        try {
          const fileIds = uploadedPhotoUrls
            .map((url) => {
              try {
                const urlObj = new URL(url);
                const pathname = urlObj.pathname.replace(/\/$/, '');
                const segments = pathname.split('/');
                return segments[segments.length - 1];
              } catch {
                return null;
              }
            })
            .filter((id): id is string => id !== null);

          if (fileIds.length > 0) {
            await utapi.deleteFiles(fileIds);
          }
        } catch {
          return {
            ...response,
            inputs: rawData,
          } as ErrorResponse & { inputs: EditStoreFormData };
        }
      }

      return {
        ...response,
        inputs: rawData,
      } as ErrorResponse & { inputs: EditStoreFormData };
    }

    redirect('/admin/locations');
  } catch (error) {
    if (isRedirectError(error)) throw error;

    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      inputs: rawData,
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse & { inputs: EditStoreFormData };
  }
};
