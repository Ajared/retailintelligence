'use server';

import { z } from 'zod/v4';
import { auth } from '../(auth)/auth';
import { utapi } from '~/lib/uploadthing';
import PostHogClient from '~/lib/posthog';
import { StoreInterface } from '~/types/store';
import { customFetch } from '~/lib/custom-fetch';
import { collectErrorMessages } from '~/lib/utils';
import { ErrorResponse, Response } from '~/types/actions';
import { AddStoreFormData, addStoreFormSchema } from './schema';

export const getAllStoresForUser = async (
  page: number = 1,
  limit: number = 20,
  sort: string = 'ASC',
  stateId?: string,
  localGovernmentId?: string,
): Promise<Response<StoreInterface[]>> => {
  const session = await auth();
  const posthog = PostHogClient();
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
      posthog.capture({
        properties: response,
        event: 'get_all_stores_error',
        distinctId: session?.user?.id!,
      });
      throw new Error(response.message);
    }

    posthog.capture({
      event: 'get_all_stores_success',
      properties: response,
      distinctId: session?.user?.id!,
    });
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  } finally {
    await posthog.shutdown();
  }
};

export const getStoreById = async (
  storeId: string,
): Promise<Response<StoreInterface>> => {
  const session = await auth();
  const posthog = PostHogClient();
  try {
    const response = await customFetch.get<StoreInterface>(
      `/stores/${storeId}`,
    );

    if (!('data' in response)) {
      posthog.capture({
        properties: response,
        event: 'get_store_by_id_error',
        distinctId: session?.user?.id!,
      });
      throw new Error(response.message);
    }

    posthog.capture({
      event: 'get_store_by_id_success',
      properties: response,
      distinctId: session?.user?.id!,
    });
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  } finally {
    await posthog.shutdown();
  }
};

export const addStore = async (
  _: Response<StoreInterface | null>,
  formData: FormData,
) => {
  const session = await auth();
  const posthog = PostHogClient();
  let rawData: AddStoreFormData | null = null;

  try {
    rawData = {
      name: formData.get('name') as string,
      state_id: formData.get('state_id') as string,
      local_government_id: formData.get('local_government_id') as string,
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

        if (uploadedPhotoUrls.length !== validPhotoFiles.length) {
          posthog.capture({
            event: 'upload_thing_warning',
            properties: {
              result: uploadResults,
              fileUrls: uploadedPhotoUrls,
              message: 'Some files failed to upload',
            },
            distinctId: session?.user?.id!,
          });
        }

        posthog.capture({
          event: 'upload_thing_success',
          properties: {
            result: uploadResults,
            fileUrls: uploadedPhotoUrls,
            message: 'Photos uploaded successfully',
          },
          distinctId: session?.user?.id!,
        });
      } catch (uploadError) {
        posthog.capture({
          event: 'upload_thing_error',
          properties: {
            error: uploadError,
            message:
              uploadError instanceof Error
                ? uploadError.message
                : 'Something went wrong',
          },
          distinctId: session?.user?.id!,
        });
        return {
          inputs: rawData,
          error: 'Photo upload failed',
          message: 'Failed to upload photos. Please try again.',
          timestamp: new Date().toISOString(),
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
          posthog.capture({
            event: 'upload_thing_file_cleanup_success',
            properties: {
              result: fileIds,
              message: 'File cleanup successful',
            },
            distinctId: session?.user?.id!,
          });
        } catch (cleanupError) {
          posthog.capture({
            event: 'upload_thing_file_cleanup_error',
            properties: {
              error: cleanupError,
              message:
                cleanupError instanceof Error
                  ? cleanupError.message
                  : 'Something went wrong',
            },
            distinctId: session?.user?.id!,
          });
        }
      }

      posthog.capture({
        event: 'create_store_error',
        properties: response,
        distinctId: session?.user?.id!,
      });
      return {
        ...response,
        inputs: rawData,
      } as ErrorResponse & { inputs: AddStoreFormData };
    }

    posthog.capture({
      properties: response,
      distinctId: session?.user?.id!,
      event: 'create_store_success',
    });
    return response;
  } catch (error) {
    posthog.capture({
      event: 'create_store_error',
      properties: {
        error: error,
        message:
          error instanceof Error ? error.message : 'Something went wrong',
      },
      distinctId: session?.user?.id!,
    });
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      inputs: rawData,
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse & { inputs: AddStoreFormData };
  } finally {
    await posthog.shutdown();
  }
};
