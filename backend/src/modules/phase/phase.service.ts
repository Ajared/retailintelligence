import {
  PhaseQueryOptions,
  ListPhaseRecordOptions,
} from './types/list-phase.type';
import { PhaseDto } from './dto/phase.dto';
import * as SYS_MSG from '~/helpers/system-messages';
import { EntityPropertyNotFoundError } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PhaseModelAction } from './phase.model-action';
import { PhaseInterface } from './types/phase.interface';
import { AbstractResponseDto } from '~/types/response.dto';
import { NullishValueError, trySafe } from '~/helpers/try-safe';
import { CustomHttpException } from '~/helpers/custom.exception';
import { CreatePhaseRecordOptions } from './types/create-phase.type';
import { UpdatePhaseRecordOptions } from './types/update-phase.type';

@Injectable()
export class PhaseService {
  constructor(private readonly phaseModelAction: PhaseModelAction) {}

  async createPhase(
    phaseDto: PhaseDto,
  ): Promise<AbstractResponseDto<PhaseInterface>> {
    const { name } = phaseDto;

    const [existingPhaseError, existingPhase] = await trySafe(() =>
      this.phaseModelAction.get({ name }),
    );

    if (
      existingPhaseError &&
      !(existingPhaseError instanceof NullishValueError)
    ) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Phase'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (existingPhase) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_ALREADY_EXISTS('Phase'),
        HttpStatus.CONFLICT,
      );
    }

    const createPhasePayload: CreatePhaseRecordOptions = {
      createPayload: phaseDto,
      transactionOptions: { useTransaction: false },
    };

    const [createPhaseError, createdPhase] = await trySafe(() =>
      this.phaseModelAction.create(createPhasePayload),
    );

    if (createPhaseError) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_CREATION_FAILED('Phase'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: createdPhase,
      message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('Phase'),
    };
  }

  async getPhaseById(
    id: string,
    queryOptions?: Record<string, unknown>,
    relations?: Record<string, unknown>,
  ): Promise<AbstractResponseDto<PhaseInterface>> {
    const [phaseError, phase] = await trySafe(() =>
      this.phaseModelAction.get({ id }, queryOptions, relations),
    );

    if (phaseError) {
      if (phaseError instanceof NullishValueError) {
        throw new CustomHttpException(
          SYS_MSG.RESOURCE_NOT_FOUND('Phase'),
          HttpStatus.NOT_FOUND,
        );
      }

      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Phase'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: phase,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Phase'),
    };
  }

  async listPhases(
    queryOptions: PhaseQueryOptions,
  ): Promise<AbstractResponseDto<PhaseInterface[]>> {
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

    const listPhaseRecordOptions: ListPhaseRecordOptions = {
      paginationPayload,
      filterRecordOptions,
    };

    const [listPhasesError, listPhases] = await trySafe(() =>
      this.phaseModelAction.list(listPhaseRecordOptions),
    );

    if (listPhasesError) {
      if (listPhasesError instanceof EntityPropertyNotFoundError) {
        throw new CustomHttpException(
          SYS_MSG.INVALID_PARAMETER('Filter Query'),
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Phases'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: listPhases.payload,
      meta: listPhases.paginationMeta,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Phases'),
    };
  }

  async updatePhase(
    id: string,
    phaseDto: PhaseDto,
  ): Promise<AbstractResponseDto<PhaseInterface>> {
    const updatePhasePayload: UpdatePhaseRecordOptions = {
      identifierOptions: { id },
      updatePayload: phaseDto,
      transactionOptions: { useTransaction: false },
    };

    const [updatePhaseError, updatedPhase] = await trySafe(() =>
      this.phaseModelAction.update(updatePhasePayload),
    );

    if (updatePhaseError) {
      if (updatePhaseError instanceof NullishValueError) {
        throw new CustomHttpException(
          SYS_MSG.RESOURCE_NOT_FOUND('Phase'),
          HttpStatus.NOT_FOUND,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_UPDATE_FAILED('Phase'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: updatedPhase,
      message: SYS_MSG.RESOURCE_UPDATED_SUCCESSFULLY('Phase'),
    };
  }
}
