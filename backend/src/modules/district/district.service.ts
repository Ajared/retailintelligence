import { DistrictDto } from './dto/district.dto';
import * as SYS_MSG from '~/helpers/system-messages';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AbstractResponseDto } from '~/types/response.dto';
import { DistrictModelAction } from './district.model-action';
import { DistrictInterface } from './types/district.interface';
import { NullishValueError, trySafe } from '~/helpers/try-safe';
import { CustomHttpException } from '~/helpers/custom.exception';
import {
  ListDistrictRecordOptions,
  DistrictQueryOptions,
} from './types/list-district.type';
import CreateDistrictRecordOptions from './types/create-district.type';
import UpdateDistrictRecordOptions from './types/update-district.type';
import { EntityPropertyNotFoundError } from 'typeorm';

@Injectable()
export class DistrictService {
  constructor(private readonly districtModelAction: DistrictModelAction) {}

  async createDistrict(
    districtDto: DistrictDto,
  ): Promise<AbstractResponseDto<DistrictInterface>> {
    const { name, phaseId } = districtDto;

    const [existingDistrictError, existingDistrict] = await trySafe(() =>
      this.districtModelAction.get({ name, phaseId }),
    );

    if (
      existingDistrictError &&
      !(existingDistrictError instanceof NullishValueError)
    ) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('District'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (existingDistrict) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_ALREADY_EXISTS('District'),
        HttpStatus.CONFLICT,
      );
    }

    const createPayload: CreateDistrictRecordOptions = {
      createPayload: districtDto,
      transactionOptions: { useTransaction: false },
    };

    const [createError, createdDistrict] = await trySafe(() =>
      this.districtModelAction.create(createPayload),
    );

    if (createError) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_CREATION_FAILED('District'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: createdDistrict,
      message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('District'),
    };
  }

  async getDistrictById(
    id: string,
    queryOptions?: Record<string, unknown>,
    relations?: Record<string, unknown>,
  ): Promise<AbstractResponseDto<DistrictInterface>> {
    const [error, district] = await trySafe(() =>
      this.districtModelAction.get({ id }, queryOptions, relations),
    );

    if (error) {
      if (error instanceof NullishValueError) {
        throw new CustomHttpException(
          SYS_MSG.RESOURCE_NOT_FOUND('District'),
          HttpStatus.NOT_FOUND,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('District'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: district,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('District'),
    };
  }

  async listDistricts(
    queryOptions: DistrictQueryOptions,
  ): Promise<AbstractResponseDto<DistrictInterface[]>> {
    const { page, limit, ...filterOptions } = queryOptions;

    const filterRecordOptions = Object.fromEntries(
      Object.entries(filterOptions).filter(
        ([, value]) => value !== undefined && value !== '',
      ),
    );

    const paginationPayload = {
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
    };

    const listOptions: ListDistrictRecordOptions = {
      paginationPayload,
      filterRecordOptions,
    };

    const [error, list] = await trySafe(() =>
      this.districtModelAction.list(listOptions),
    );

    if (error) {
      if (error instanceof EntityPropertyNotFoundError) {
        throw new CustomHttpException(
          SYS_MSG.INVALID_PARAMETER('Filter Query'),
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Districts'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: list.payload,
      meta: list.paginationMeta,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Districts'),
    };
  }

  async updateDistrict(
    id: string,
    districtDto: DistrictDto,
  ): Promise<AbstractResponseDto<DistrictInterface>> {
    const updatePayload: UpdateDistrictRecordOptions = {
      identifierOptions: { id },
      updatePayload: districtDto,
      transactionOptions: { useTransaction: false },
    };

    const [error, updated] = await trySafe(() =>
      this.districtModelAction.update(updatePayload),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_UPDATE_FAILED('District'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: updated,
      message: SYS_MSG.RESOURCE_UPDATED_SUCCESSFULLY('District'),
    };
  }
}
