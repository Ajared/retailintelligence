import * as SYS_MSG from '~/helpers/system-messages';
import { UserModelAction } from './user.model-action';
import { HttpStatus, Injectable } from '@nestjs/common';
import ListUserRecordOptions from './types/list-user.type';
import UpdateUserRecordOptions from './types/update-user.type';
import CreateUserRecordOptions from './types/create-user.type';
import { NullishValueError, trySafe } from '~/helpers/try-safe';
import { PaginationOptions } from '~/helpers/pagination.helper';
import { CustomHttpException } from '~/helpers/custom.exception';
import { UserRole, UserStatus } from './constants/user.constant';

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
      if (error instanceof NullishValueError) {
        return null;
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('User'),
        HttpStatus.INTERNAL_SERVER_ERROR,
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
      if (error instanceof NullishValueError) {
        return null;
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('User'),
        HttpStatus.INTERNAL_SERVER_ERROR,
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
      data: data.payload,
      meta: data.paginationMeta,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Users'),
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

  async deactivateUser(id: string, deactivatedBy: string) {
    const [userError, user] = await trySafe(() => this.getUserById(id));
    const [deactivatedByError, deactivatedByUser] = await trySafe(() =>
      this.getUserById(deactivatedBy),
    );

    if (userError || deactivatedByError) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_NOT_FOUND('User'),
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_FAILED('User Deactivation'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const userRole = user.role;
    const deactivatedByRole = deactivatedByUser.role;

    if (
      userRole === UserRole.SUPER_ADMIN &&
      deactivatedByRole !== UserRole.SUPER_ADMIN
    ) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_FAILED('User Deactivation'),
        HttpStatus.FORBIDDEN,
      );
    }

    if (
      userRole === UserRole.ADMIN &&
      deactivatedByRole !== UserRole.SUPER_ADMIN
    ) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_FAILED('User Deactivation'),
        HttpStatus.FORBIDDEN,
      );
    }

    const payload: UpdateUserRecordOptions = {
      identifierOptions: { id },
      updatePayload: { status: UserStatus.INACTIVE },
      transactionOptions: {
        useTransaction: false,
      },
    };

    const [error, data] = await trySafe(() =>
      this.userModelAction.update(payload),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_FAILED('User Deactivation'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('User Deactivation'),
      data,
    };
  }
}
