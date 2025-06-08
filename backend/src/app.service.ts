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

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly stateModelAction: StateModelAction,
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
}
