import { trySafe } from './helpers/try-safe';
import { ConfigService } from '@nestjs/config';
import * as SYS_MSG from '~/helpers/system-messages';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AbstractResponseDto } from './types/response.dto';
import { PaginationOptions } from './helpers/pagination.helper';
import { CustomHttpException } from './helpers/custom.exception';
import { StateModelAction } from './modules/state/state.model-action';
import { StateInterface } from './modules/state/types/state.interface';
import ListStateRecordOptions from './modules/state/types/list-state.type';

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
    paginationOptions: PaginationOptions,
  ): Promise<AbstractResponseDto<StateInterface[]>> {
    const paginationPayload = {
      page: paginationOptions?.page ? +paginationOptions.page : 1,
      limit: paginationOptions?.limit ? +paginationOptions.limit : 10,
    };

    const listStateRecordOptions: ListStateRecordOptions = {
      paginationPayload,
      filterRecordOptions: {},
      relations: {
        localGovernments: true,
      },
    };

    const [listStatesError, listStates] = await trySafe(() =>
      this.stateModelAction.list(listStateRecordOptions),
    );

    if (listStatesError) {
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
