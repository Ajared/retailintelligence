'use server';

import { z } from 'zod/v4';
import { utapi } from '~/lib/uploadthing';
import { StoreInterface } from '~/types/store';
import { customFetch } from '~/lib/custom-fetch';
import { collectErrorMessages } from '~/lib/utils';
import { AddStoreFormData, addStoreFormSchema } from './schema';
import type {
  Response,
  ErrorResponse,
  PaginatedSuccessResponse,
} from '~/types/actions';

export const getAllStoresForUser = async (
  page: number = 1,
  limit: number = 20,
  sort: string = 'ASC',
  stateId?: string,
  localGovernmentId?: string,
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

    const response = await customFetch.get<StoreInterface[]>(
      `/stores?${queryParams.toString()}`,
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
      `/stores/${storeId}`,
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

export const addStore = async (
  _: Response<StoreInterface | null>,
  formData: FormData,
) => {
  let rawData: AddStoreFormData | null = null;

  try {
    rawData = {
      name: formData.get('name') as string,
      state_id: formData.get('state_id') as string,
      local_government_id: formData.get('local_government_id') as string,
      phase_id: formData.get('phase_id') as string,
      district_id: formData.get('district_id') as string,
      address: formData.get('address') as string,
      store_type: formData.get('store_type') as string,
      latitude: Number(formData.get('latitude')),
      longitude: Number(formData.get('longitude')),
      landmarks: formData.get('landmarks') as string,
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

    return response;
  } catch (error) {
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

export const getUserMapData = async (
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  opts: { page?: number; limit?: number; sort?: 'ASC' | 'DESC' } = {},
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
      const response = await customFetch.get<StoreInterface[]>(
        `/stores?${params.toString()}`,
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
