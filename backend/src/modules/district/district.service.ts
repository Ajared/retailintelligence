import { DistrictDto } from './dto/district.dto';
import * as SYS_MSG from '~/helpers/system-messages';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AbstractResponseDto } from '~/types/response.dto';
import { DistrictModelAction } from './district.model-action';
import { DistrictInterface } from './types/district.interface';
import { PaginationOptions } from '~/helpers/pagination.helper';
import { NullishValueError, trySafe } from '~/helpers/try-safe';
import { CustomHttpException } from '~/helpers/custom.exception';
import ListDistrictRecordOptions from './types/list-district.type';
import CreateDistrictRecordOptions from './types/create-district.type';
import UpdateDistrictRecordOptions from './types/update-district.type';

@Injectable()
export class DistrictService {
  constructor(private readonly districtModelAction: DistrictModelAction) {}

  async createDistrict(
    districtDto: DistrictDto,
  ): Promise<AbstractResponseDto<DistrictInterface>> {
    const { name } = districtDto;

    const [existingDistrictError, existingDistrict] = await trySafe(() =>
      this.districtModelAction.get({ name }),
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

    const createDistrictPayload: CreateDistrictRecordOptions = {
      createPayload: districtDto,
      transactionOptions: { useTransaction: false },
    };

    const [createDistrictError, createdDistrict] = await trySafe(() =>
      this.districtModelAction.create(createDistrictPayload),
    );

    if (createDistrictError) {
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
    const [districtError, district] = await trySafe(() =>
      this.districtModelAction.get({ id }, queryOptions, relations),
    );

    if (districtError) {
      if (districtError instanceof NullishValueError) {
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
    paginationOptions: PaginationOptions,
  ): Promise<AbstractResponseDto<DistrictInterface[]>> {
    const paginationPayload = {
      page: paginationOptions?.page ? +paginationOptions.page : 1,
      limit: paginationOptions?.limit ? +paginationOptions.limit : 10,
    };

    const listDistrictRecordOptions: ListDistrictRecordOptions = {
      paginationPayload,
      filterRecordOptions: {},
    };

    const [listDistrictsError, listDistricts] = await trySafe(() =>
      this.districtModelAction.list(listDistrictRecordOptions),
    );

    if (listDistrictsError) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('District'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: listDistricts.payload,
      meta: listDistricts.paginationMeta,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('District'),
    };
  }

  async updateDistrict(
    id: string,
    districtDto: DistrictDto,
  ): Promise<AbstractResponseDto<DistrictInterface>> {
    const updateDistrictPayload: UpdateDistrictRecordOptions = {
      identifierOptions: { id },
      updatePayload: districtDto,
      transactionOptions: { useTransaction: false },
    };

    const [updateDistrictError, updatedDistrict] = await trySafe(() =>
      this.districtModelAction.update(updateDistrictPayload),
    );

    if (updateDistrictError) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_UPDATE_FAILED('District'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: updatedDistrict,
      message: SYS_MSG.RESOURCE_UPDATED_SUCCESSFULLY('District'),
    };
  }
}
