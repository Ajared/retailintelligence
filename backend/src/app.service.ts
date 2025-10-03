import { trySafe } from './helpers/try-safe';
import { ConfigService } from '@nestjs/config';
import * as SYS_MSG from '~/helpers/system-messages';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AbstractResponseDto } from './types/response.dto';
import { CustomHttpException } from './helpers/custom.exception';
import { StateModelAction } from './modules/state/state.model-action';
import { StateInterface } from './modules/state/types/state.interface';
import {
  StateQueryOptions,
  ListStateRecordOptions,
} from './modules/state/types/list-state.type';
import { EntityPropertyNotFoundError } from 'typeorm';
import { PhaseModelAction } from './modules/phase/phase.model-action';
import { PhaseInterface } from './modules/phase/types/phase.interface';
import {
  ListPhaseRecordOptions,
  PhaseQueryOptions,
} from './modules/phase/types/list-phase.type';
import { StoreModelAction } from './modules/store/store.model-action';
import { StoreInterface } from './modules/store/types/store.interface';
import {
  ListStoreRecordOptions,
  StoreQueryOptions,
} from './modules/store/types/list-store.type';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly stateModelAction: StateModelAction,
    private readonly phaseModelAction: PhaseModelAction,
    private readonly storeModelAction: StoreModelAction,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): Record<string, unknown> {
    return {
      message: 'All services are running',
      data: {
        version: this.configService.get<string>('npm_package_version'),
        uptime: process.uptime(),
        environment: this.configService.get<string>('NODE_ENV'),
      },
    };
  }

  async getLocations(
    queryOptions: StateQueryOptions,
  ): Promise<AbstractResponseDto<StateInterface[]>> {
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

    const listStateRecordOptions: ListStateRecordOptions = {
      paginationPayload,
      filterRecordOptions,
      relations: {
        localGovernments: true,
      },
    };

    const [listStatesError, listStates] = await trySafe(() =>
      this.stateModelAction.list(listStateRecordOptions),
    );

    if (listStatesError) {
      if (listStatesError instanceof EntityPropertyNotFoundError) {
        throw new CustomHttpException(
          SYS_MSG.INVALID_PARAMETER('Filter Query'),
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Locations'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: listStates.payload,
      meta: listStates.paginationMeta,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Locations'),
    };
  }

  async getPhases(
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
      relations: {
        districts: true,
      },
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

  async dgetDashboardData(
    queryOptions: StoreQueryOptions,
  ): Promise<AbstractResponseDto<StoreInterface[]>> {
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

    const [stateError, state] = await trySafe(() =>
      this.stateModelAction.get({ name: 'FCT Abuja' }),
    );

    if (stateError) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('State'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const listStoreRecordOptions: ListStoreRecordOptions = {
      paginationPayload,
      filterRecordOptions: { ...filterRecordOptions, stateId: state.id },
      relations: {
        state: true,
        enumerator: true,
        localGovernment: true,
        phase: true,
        district: true,
      },
    };

    const [error, data] = await trySafe(() =>
      this.storeModelAction.list(listStoreRecordOptions),
    );

    if (error) {
      if (error instanceof EntityPropertyNotFoundError) {
        throw new CustomHttpException(
          SYS_MSG.INVALID_PARAMETER('Filter Query'),
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Stores'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: data.payload,
      meta: data.paginationMeta,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Stores'),
    };
  }
}
