import { AssignLocationDto } from './dto/user.dto';
import * as SYS_MSG from '~/helpers/system-messages';
import { StateService } from '../state/state.service';
import { UserModelAction } from './user.model-action';
import { EntityPropertyNotFoundError } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import UpdateUserRecordOptions from './types/update-user.type';
import CreateUserRecordOptions from './types/create-user.type';
import { NullishValueError, trySafe } from '~/helpers/try-safe';
import { CustomHttpException } from '~/helpers/custom.exception';
import { UserRole, UserStatus } from './constants/user.constant';
import {
  UserQueryOptions,
  ListUserRecordOptions,
} from './types/list-user.type';
import { validateUUID } from '~/helpers/validation.helper';

@Injectable()
export class UserService {
  constructor(
    private stateService: StateService,
    private userModelAction: UserModelAction,
  ) {}

  async assignLocationToUser(
    userId: string,
    assignLocationDto: AssignLocationDto,
  ) {
    validateUUID(userId, 'userId');

    const { stateId, localGovernmentId, phaseId, districtId } =
      assignLocationDto;

    const [userError, user] = await trySafe(() => this.getUserById(userId));

    if (userError || !user) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_NOT_FOUND('User'),
        HttpStatus.NOT_FOUND,
      );
    }

    const [stateError, stateData] = await trySafe(() =>
      this.stateService.getStateById(
        stateId,
        {},
        {
          localGovernments: true,
          phases: {
            districts: true,
          },
        },
      ),
    );

    if (stateError || !stateData) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_NOT_FOUND('State'),
        HttpStatus.NOT_FOUND,
      );
    }

    const state = stateData.data;

    if (localGovernmentId) {
      const localGovernment = state?.localGovernments?.find(
        (lg) => lg.id === localGovernmentId,
      );

      if (!localGovernment) {
        throw new CustomHttpException(
          'Local government does not belong to the selected state',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (districtId && !phaseId) {
      throw new CustomHttpException(
        'Phase is required when a district is selected',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (phaseId) {
      if (!districtId) {
        throw new CustomHttpException(
          'District is required when a phase is selected',
          HttpStatus.BAD_REQUEST,
        );
      }

      const phase = state?.phases?.find((p) => p.id === phaseId);

      if (!phase) {
        throw new CustomHttpException(
          'Phase does not belong to the selected state',
          HttpStatus.BAD_REQUEST,
        );
      }

      const district = phase?.districts?.find((d) => d.id === districtId);

      if (!district) {
        throw new CustomHttpException(
          'District does not belong to the selected phase',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const payload: UpdateUserRecordOptions = {
      identifierOptions: { id: userId },
      updatePayload: {
        ...(stateId && { assignedStateId: stateId }),
        ...(localGovernmentId && {
          assignedLocalGovernmentId: localGovernmentId,
        }),
        ...(phaseId && { assignedPhaseId: phaseId }),
        ...(districtId && { assignedDistrictId: districtId }),
      },
      transactionOptions: {
        useTransaction: false,
      },
    };

    const [updateError, data] = await trySafe(() => this.updateUser(payload));

    if (updateError) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_FAILED('Location Assignment'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('Location Assignment'),
      data,
    };
  }

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
    validateUUID(id, 'id');

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

  async listUsers(queryOptions: UserQueryOptions) {
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

    const listUserRecordOptions: ListUserRecordOptions = {
      paginationPayload,
      filterRecordOptions,
      relations: {
        assignedState: true,
        assignedLocalGovernment: true,
        assignedPhase: true,
        assignedDistrict: true,
      },
    };

    const [error, data] = await trySafe(() =>
      this.userModelAction.list(listUserRecordOptions),
    );

    if (error) {
      if (error instanceof EntityPropertyNotFoundError) {
        throw new CustomHttpException(
          SYS_MSG.INVALID_PARAMETER('Filter Query'),
          HttpStatus.BAD_REQUEST,
        );
      }
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
    validateUUID(id, 'id');
    validateUUID(deactivatedBy, 'deactivatedBy');

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

    if (user.deactivatedAt) {
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
      updatePayload: { deactivatedAt: new Date() },
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

  async reactivateUser(id: string, reactivatedBy: string) {
    validateUUID(id, 'id');
    validateUUID(reactivatedBy, 'reactivatedBy');

    const [userError, user] = await trySafe(() => this.getUserById(id));
    const [reactivatedByError, reactivatedByUser] = await trySafe(() =>
      this.getUserById(reactivatedBy),
    );

    if (userError || reactivatedByError) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_NOT_FOUND('User'),
        HttpStatus.NOT_FOUND,
      );
    }

    if (!user.deactivatedAt) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_FAILED('User Reactivation'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const userRole = user.role;
    const reactivatedByRole = reactivatedByUser.role;

    if (
      userRole === UserRole.SUPER_ADMIN &&
      reactivatedByRole !== UserRole.SUPER_ADMIN
    ) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_FAILED('User Reactivation'),
        HttpStatus.FORBIDDEN,
      );
    }

    if (
      userRole === UserRole.ADMIN &&
      reactivatedByRole !== UserRole.SUPER_ADMIN
    ) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_FAILED('User Reactivation'),
        HttpStatus.FORBIDDEN,
      );
    }

    const payload: UpdateUserRecordOptions = {
      identifierOptions: { id },
      updatePayload: { deactivatedAt: null },
      transactionOptions: {
        useTransaction: false,
      },
    };

    const [error, data] = await trySafe(() =>
      this.userModelAction.update(payload),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_FAILED('User Reactivation'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('User Reactivation'),
      data,
    };
  }

  async verifyUser(id: string, verifiedBy: string) {
    validateUUID(id, 'id');
    validateUUID(verifiedBy, 'verifiedBy');

    const [userError] = await trySafe(() => this.getUserById(id));
    const [verifiedByError, verifiedByUser] = await trySafe(() =>
      this.getUserById(verifiedBy),
    );

    if (userError || verifiedByError) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_NOT_FOUND('User'),
        HttpStatus.NOT_FOUND,
      );
    }

    const verifiedByRole = verifiedByUser.role;

    if (
      verifiedByRole !== UserRole.SUPER_ADMIN &&
      verifiedByRole !== UserRole.ADMIN
    ) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_FAILED('User Verification'),
        HttpStatus.FORBIDDEN,
      );
    }

    const payload: UpdateUserRecordOptions = {
      identifierOptions: {
        id,
        status: UserStatus.UNVERIFIED,
      },
      updatePayload: { status: UserStatus.VERIFIED },
      transactionOptions: {
        useTransaction: false,
      },
    };

    const [error, data] = await trySafe(() =>
      this.userModelAction.update(payload),
    );

    if (error) {
      if (error instanceof NullishValueError) {
        throw new CustomHttpException(
          SYS_MSG.RESOURCE_ALREADY_VERIFIED('User'),
          HttpStatus.CONFLICT,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_FAILED('User Verification'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('User Verification'),
      data,
    };
  }
}
