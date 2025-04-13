import { trySafe } from '~/helpers/try-safe';
import * as SYS_MSG from '~/helpers/system-messages';
import { UserModelAction } from './user.model-action';
import { HttpStatus, Injectable } from '@nestjs/common';
import ListUserRecordOptions from './types/list-user.type';
import UpdateUserRecordOptions from './types/update-user.type';
import CreateUserRecordOptions from './types/create-user.type';
import { PaginationOptions } from '~/helpers/pagination.helper';
import { CustomHttpException } from '~/helpers/custom.exception';

@Injectable()
export class UserService {
  constructor(private userModelAction: UserModelAction) {}

  async createUser(createUserPayload: CreateUserRecordOptions) {
    const [error, data] = await trySafe(() =>
      this.userModelAction.create(createUserPayload),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_CREATION_FAILED('User'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data;
  }

  async getUserById(
    id: string,
    queryOptions?: Record<string, unknown>,
    relations?: Record<string, unknown>,
  ) {
    const [error, data] = await trySafe(() =>
      this.userModelAction.get({ id }, queryOptions, relations),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_NOT_FOUND('User'),
        HttpStatus.NOT_FOUND,
      );
    }

    return data;
  }

  async getUserByEmail(
    email: string,
    queryOptions?: Record<string, unknown>,
    relations?: Record<string, unknown>,
  ) {
    const [error, data] = await trySafe(() =>
      this.userModelAction.get({ email }, queryOptions, relations),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_NOT_FOUND('User'),
        HttpStatus.NOT_FOUND,
      );
    }

    return data;
  }

  async listUsers(paginationOptions: PaginationOptions) {
    const paginationPayload = {
      page: paginationOptions?.page ? +paginationOptions.page : 1,
      limit: paginationOptions?.limit ? +paginationOptions.limit : 10,
    };

    const listUserRecordOptions: ListUserRecordOptions = {
      paginationPayload,
      filterRecordOptions: {},
    };

    const [error, data] = await trySafe(() =>
      this.userModelAction.list(listUserRecordOptions),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Users'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Users'),
      data: data.payload,
      meta: data.paginationMeta,
    };
  }
  async updateUser(updatePayload: UpdateUserRecordOptions) {
    const [error, data] = await trySafe(() =>
      this.userModelAction.update(updatePayload),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_UPDATE_FAILED('User'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data;
  }
}
