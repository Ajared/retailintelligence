import { LocalGovernmentDto } from './dto/local-government.dto';
import * as SYS_MSG from '~/helpers/system-messages';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AbstractResponseDto } from '~/types/response.dto';
import { LocalGovernmentModelAction } from './local-government.model-action';
import { LocalGovernmentInterface } from './types/local-government.interface';
import { PaginationOptions } from '~/helpers/pagination.helper';
import { NullishValueError, trySafe } from '~/helpers/try-safe';
import { CustomHttpException } from '~/helpers/custom.exception';
import ListLocalGovernmentRecordOptions from './types/list-local-government.type';
import CreateLocalGovernmentRecordOptions from './types/create-local-government.type';
import UpdateLocalGovernmentRecordOptions from './types/update-local-government.type';

@Injectable()
export class LocalGovernmentService {
  constructor(
    private readonly localGovernmentModelAction: LocalGovernmentModelAction,
  ) {}

  async createLocalGovernment(
    localGovernmentDto: LocalGovernmentDto,
  ): Promise<AbstractResponseDto<LocalGovernmentInterface>> {
    const { name } = localGovernmentDto;

    const [existingLocalGovernmentError, existingLocalGovernment] =
      await trySafe(() => this.localGovernmentModelAction.get({ name }));

    if (
      existingLocalGovernmentError &&
      !(existingLocalGovernmentError instanceof NullishValueError)
    ) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Local Government'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (existingLocalGovernment) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_ALREADY_EXISTS('Local Government'),
        HttpStatus.CONFLICT,
      );
    }

    const createPayload: CreateLocalGovernmentRecordOptions = {
      createPayload: localGovernmentDto,
      transactionOptions: { useTransaction: false },
    };

    const [createError, createdLocalGovernment] = await trySafe(() =>
      this.localGovernmentModelAction.create(createPayload),
    );

    if (createError) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_CREATION_FAILED('Local Government'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: createdLocalGovernment,
      message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('Local Government'),
    };
  }

  async getLocalGovernmentById(
    id: string,
    queryOptions?: Record<string, unknown>,
    relations?: Record<string, unknown>,
  ): Promise<AbstractResponseDto<LocalGovernmentInterface>> {
    const [error, localGovernment] = await trySafe(() =>
      this.localGovernmentModelAction.get({ id }, queryOptions, relations),
    );

    if (error) {
      if (error instanceof NullishValueError) {
        throw new CustomHttpException(
          SYS_MSG.RESOURCE_NOT_FOUND('Local Government'),
          HttpStatus.NOT_FOUND,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Local Government'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: localGovernment,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Local Government'),
    };
  }

  async listLocalGovernments(
    paginationOptions: PaginationOptions,
  ): Promise<AbstractResponseDto<LocalGovernmentInterface[]>> {
    const paginationPayload = {
      page: paginationOptions?.page ? +paginationOptions.page : 1,
      limit: paginationOptions?.limit ? +paginationOptions.limit : 10,
    };

    const listOptions: ListLocalGovernmentRecordOptions = {
      paginationPayload,
      filterRecordOptions: {},
    };

    const [error, list] = await trySafe(() =>
      this.localGovernmentModelAction.list(listOptions),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Local Government'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: list.payload,
      meta: list.paginationMeta,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Local Government'),
    };
  }

  async updateLocalGovernment(
    id: string,
    localGovernmentDto: LocalGovernmentDto,
  ): Promise<AbstractResponseDto<LocalGovernmentInterface>> {
    const updatePayload: UpdateLocalGovernmentRecordOptions = {
      identifierOptions: { id },
      updatePayload: localGovernmentDto,
      transactionOptions: { useTransaction: false },
    };

    const [error, updated] = await trySafe(() =>
      this.localGovernmentModelAction.update(updatePayload),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_UPDATE_FAILED('Local Government'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: updated,
      message: SYS_MSG.RESOURCE_UPDATED_SUCCESSFULLY('Local Government'),
    };
  }
}
