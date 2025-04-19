import { StoreDto } from './dto/store.dto';
import * as SYS_MSG from '~/helpers/system-messages';
import { HttpStatus, Injectable } from '@nestjs/common';
import { StoreModelAction } from './store.model-action';
import { StoreInterface } from './types/store.interface';
import { AbstractResponseDto } from '~/types/response.dto';
import ListStoreRecordOptions from './types/list-store.type';
import { PaginationOptions } from '~/helpers/pagination.helper';
import { NullishValueError, trySafe } from '~/helpers/try-safe';
import { CustomHttpException } from '~/helpers/custom.exception';
import UpdateStoreRecordOptions from './types/update-store.type';
import CreateStoreRecordOptions from './types/create-store.type';

@Injectable()
export class StoreService {
  constructor(private readonly storeModelAction: StoreModelAction) {}

  async createStore(
    storeDto: StoreDto,
  ): Promise<AbstractResponseDto<StoreInterface>> {
    const { storeName } = storeDto;

    const [existingStoreError, existingStore] = await trySafe(() =>
      this.storeModelAction.get({ storeName }),
    );

    if (
      existingStoreError &&
      !(existingStoreError instanceof NullishValueError)
    ) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Store'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (existingStore) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_ALREADY_EXISTS('Store'),
        HttpStatus.CONFLICT,
      );
    }

    const createStorePayload: CreateStoreRecordOptions = {
      createPayload: storeDto,
      transactionOptions: { useTransaction: false },
    };

    const [error, data] = await trySafe(() =>
      this.storeModelAction.create(createStorePayload),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_CREATION_FAILED('Store'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data,
      message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('Store'),
    };
  }

  async getStoreById(
    id: string,
    queryOptions?: Record<string, unknown>,
    relations?: Record<string, unknown>,
  ): Promise<AbstractResponseDto<StoreInterface>> {
    const [error, data] = await trySafe(() =>
      this.storeModelAction.get({ id }, queryOptions, relations),
    );

    if (error) {
      if (error instanceof NullishValueError) {
        throw new CustomHttpException(
          SYS_MSG.RESOURCE_NOT_FOUND('Store'),
          HttpStatus.NOT_FOUND,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Store'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Store'),
    };
  }

  async listStores(
    paginationOptions: PaginationOptions,
  ): Promise<AbstractResponseDto<StoreInterface[]>> {
    const paginationPayload = {
      page: paginationOptions?.page ? +paginationOptions.page : 1,
      limit: paginationOptions?.limit ? +paginationOptions.limit : 10,
    };

    const listStoreRecordOptions: ListStoreRecordOptions = {
      paginationPayload,
      filterRecordOptions: {},
    };

    const [error, data] = await trySafe(() =>
      this.storeModelAction.list(listStoreRecordOptions),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Store'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: data.payload,
      meta: data.paginationMeta,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Store'),
    };
  }

  async updateStore(
    id: string,
    storeDto: StoreDto,
  ): Promise<AbstractResponseDto<StoreInterface>> {
    const updateStorePayload: UpdateStoreRecordOptions = {
      identifierOptions: { id },
      updatePayload: storeDto,
      transactionOptions: { useTransaction: false },
    };

    const [error, data] = await trySafe(() =>
      this.storeModelAction.update(updateStorePayload),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_UPDATE_FAILED('Store'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data,
      message: SYS_MSG.RESOURCE_UPDATED_SUCCESSFULLY('Store'),
    };
  }
}
