import { StateDto } from './dto/state.dto';
import * as SYS_MSG from '~/helpers/system-messages';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AbstractResponseDto } from '~/types/response.dto';
import { StateModelAction } from './state.model-action';
import { StateInterface } from './types/state.interface';
import { PaginationOptions } from '~/helpers/query.helper';
import { NullishValueError, trySafe } from '~/helpers/try-safe';
import { CustomHttpException } from '~/helpers/custom.exception';
import { ListStateRecordOptions } from './types/list-state.type';
import { CreateStateRecordOptions } from './types/create-state.type';
import { UpdateStateRecordOptions } from './types/update-state.type';

@Injectable()
export class StateService {
  constructor(private readonly stateModelAction: StateModelAction) {}

  async createState(
    stateDto: StateDto,
  ): Promise<AbstractResponseDto<StateInterface>> {
    const { name } = stateDto;

    const [existingStateError, existingState] = await trySafe(() =>
      this.stateModelAction.get({ name }),
    );

    if (
      existingStateError &&
      !(existingStateError instanceof NullishValueError)
    ) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('State'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (existingState) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_ALREADY_EXISTS('State'),
        HttpStatus.CONFLICT,
      );
    }

    const createStatePayload: CreateStateRecordOptions = {
      createPayload: stateDto,
      transactionOptions: { useTransaction: false },
    };

    const [createStateError, createdState] = await trySafe(() =>
      this.stateModelAction.create(createStatePayload),
    );

    if (createStateError) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_CREATION_FAILED('State'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: createdState,
      message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('State'),
    };
  }

  async getStateById(
    id: string,
    queryOptions?: Record<string, unknown>,
    relations?: Record<string, unknown>,
  ): Promise<AbstractResponseDto<StateInterface>> {
    const [stateError, state] = await trySafe(() =>
      this.stateModelAction.get({ id }, queryOptions, relations),
    );

    if (stateError) {
      if (stateError instanceof NullishValueError) {
        throw new CustomHttpException(
          SYS_MSG.RESOURCE_NOT_FOUND('State'),
          HttpStatus.NOT_FOUND,
        );
      }

      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('State'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: state,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('State'),
    };
  }

  async listStates(
    paginationOptions: PaginationOptions,
  ): Promise<AbstractResponseDto<StateInterface[]>> {
    const paginationPayload = {
      page: paginationOptions?.page ? +paginationOptions.page : 1,
      limit: paginationOptions?.limit ? +paginationOptions.limit : 10,
    };

    const listStateRecordOptions: ListStateRecordOptions = {
      paginationPayload,
      filterRecordOptions: {},
    };

    const [listStatesError, listStates] = await trySafe(() =>
      this.stateModelAction.list(listStateRecordOptions),
    );

    if (listStatesError) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('States'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: listStates.payload,
      meta: listStates.paginationMeta,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('States'),
    };
  }

  async updateState(
    id: string,
    stateDto: StateDto,
  ): Promise<AbstractResponseDto<StateInterface>> {
    const updateStatePayload: UpdateStateRecordOptions = {
      identifierOptions: { id },
      updatePayload: stateDto,
      transactionOptions: { useTransaction: false },
    };

    const [updateStateError, updatedState] = await trySafe(() =>
      this.stateModelAction.update(updateStatePayload),
    );

    if (updateStateError) {
      if (updateStateError instanceof NullishValueError) {
        throw new CustomHttpException(
          SYS_MSG.RESOURCE_NOT_FOUND('State'),
          HttpStatus.NOT_FOUND,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_UPDATE_FAILED('State'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: updatedState,
      message: SYS_MSG.RESOURCE_UPDATED_SUCCESSFULLY('State'),
    };
  }
}
