import { UserService } from './user.service';
import * as SYS_MSG from '~/helpers/system-messages';
import { Test, TestingModule } from '@nestjs/testing';
import { UserModelAction } from './user.model-action';
import {
  ListUserRecordOptions,
  UserQueryOptions,
} from './types/list-user.type';
import { StateService } from '../state/state.service';
import { UserRole } from './constants/user.constant';
import { CustomHttpException } from '~/helpers/custom.exception';

interface MockUserModelAction {
  list: jest.Mock<
    Promise<{ payload: unknown[]; paginationMeta: unknown }>,
    [ListUserRecordOptions]
  >;
  get: jest.Mock;
  delete: jest.Mock;
  update: jest.Mock;
}

const createMockUserModelAction = (): MockUserModelAction => ({
  list: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let mockModelAction: MockUserModelAction;

  beforeEach(async () => {
    mockModelAction = createMockUserModelAction();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserModelAction,
          useValue: mockModelAction,
        },
        {
          provide: StateService,
          useValue: {
            getStateById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listUsers', () => {
    it('should call modelAction.list with provided pagination options (as strings) and return formatted result', async () => {
      const queryOptions = { page: '2', limit: '20' };
      const mockData = [{ id: 'user-1', name: 'Test User' }];
      const mockMeta = { total: 1 };
      mockModelAction.list.mockResolvedValue({
        payload: mockData,
        paginationMeta: mockMeta,
      });

      const expectedListOptions: ListUserRecordOptions = {
        paginationPayload: {
          page: 2,
          limit: 20,
        },
        filterRecordOptions: {},
        relations: {
          assignedState: true,
          assignedLocalGovernment: true,
          assignedPhase: true,
          assignedDistrict: true,
        },
      };

      const result = await service.listUsers(queryOptions);

      expect(mockModelAction.list).toHaveBeenCalledTimes(1);
      expect(mockModelAction.list).toHaveBeenCalledWith(expectedListOptions);
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Users'),
        data: mockData,
        meta: mockMeta,
      });
    });

    it('should call modelAction.list with default pagination when options are undefined', async () => {
      const queryOptions: UserQueryOptions = {};
      const mockResponse = { payload: [], paginationMeta: { total: 0 } };
      mockModelAction.list.mockResolvedValue(mockResponse);

      const expectedListOptions: ListUserRecordOptions = {
        paginationPayload: {
          page: 1,
          limit: 10,
        },
        filterRecordOptions: {},
        relations: {
          assignedState: true,
          assignedLocalGovernment: true,
          assignedPhase: true,
          assignedDistrict: true,
        },
      };

      const result = await service.listUsers(queryOptions);

      expect(mockModelAction.list).toHaveBeenCalledTimes(1);
      expect(mockModelAction.list).toHaveBeenCalledWith(expectedListOptions);
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Users'),
        data: mockResponse.payload,
        meta: mockResponse.paginationMeta,
      });
    });

    it('should call modelAction.list with default pagination when options is an empty object', async () => {
      const queryOptions: UserQueryOptions = {};
      const mockResponse = { payload: [], paginationMeta: { total: 0 } };
      mockModelAction.list.mockResolvedValue(mockResponse);

      const expectedListOptions: ListUserRecordOptions = {
        paginationPayload: {
          page: 1,
          limit: 10,
        },
        filterRecordOptions: {},
        relations: {
          assignedState: true,
          assignedLocalGovernment: true,
          assignedPhase: true,
          assignedDistrict: true,
        },
      };

      const result = await service.listUsers(queryOptions);

      expect(mockModelAction.list).toHaveBeenCalledTimes(1);
      expect(mockModelAction.list).toHaveBeenCalledWith(expectedListOptions);
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Users'),
        data: mockResponse.payload,
        meta: mockResponse.paginationMeta,
      });
    });

    it('should use default page when only limit is provided', async () => {
      const queryOptions: UserQueryOptions = { limit: '15' };
      const mockResponse = {
        payload: [{ id: 'user-2' }],
        paginationMeta: { total: 1 },
      };
      mockModelAction.list.mockResolvedValue(mockResponse);

      const expectedListOptions: ListUserRecordOptions = {
        paginationPayload: {
          page: 1,
          limit: 15,
        },
        filterRecordOptions: {},
        relations: {
          assignedState: true,
          assignedLocalGovernment: true,
          assignedPhase: true,
          assignedDistrict: true,
        },
      };

      const result = await service.listUsers(queryOptions);

      expect(mockModelAction.list).toHaveBeenCalledTimes(1);
      expect(mockModelAction.list).toHaveBeenCalledWith(expectedListOptions);
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Users'),
        data: mockResponse.payload,
        meta: mockResponse.paginationMeta,
      });
    });

    it('should use default limit when only page is provided', async () => {
      const queryOptions: UserQueryOptions = { page: '4' };
      const mockResponse = {
        payload: [{ id: 'user-3' }],
        paginationMeta: { total: 1 },
      };
      mockModelAction.list.mockResolvedValue(mockResponse);

      const expectedListOptions: ListUserRecordOptions = {
        paginationPayload: {
          page: 4,
          limit: 10,
        },
        filterRecordOptions: {},
        relations: {
          assignedState: true,
          assignedLocalGovernment: true,
          assignedPhase: true,
          assignedDistrict: true,
        },
      };

      const result = await service.listUsers(queryOptions);

      expect(mockModelAction.list).toHaveBeenCalledTimes(1);
      expect(mockModelAction.list).toHaveBeenCalledWith(expectedListOptions);
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Users'),
        data: mockResponse.payload,
        meta: mockResponse.paginationMeta,
      });
    });
  });

  describe('deleteUser', () => {
    const userId = '123e4567-e89b-42d3-a456-426614174000';
    const deletedBy = '123e4567-e89b-42d3-a456-426614174001';
    const mockUser = {
      id: userId,
      email: 'user@example.com',
      role: UserRole.USER,
    };
    const mockAdmin = {
      id: deletedBy,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    };

    it('should successfully delete a user', async () => {
      mockModelAction.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockAdmin);
      mockModelAction.delete.mockResolvedValueOnce({ affected: 1 });

      const result = await service.deleteUser(userId, deletedBy);

      expect(mockModelAction.get).toHaveBeenCalledTimes(2);
      expect(mockModelAction.delete).toHaveBeenCalledWith({
        identifierOptions: { id: userId },
        transactionOptions: {
          useTransaction: false,
        },
      });
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('User Deletion'),
      });
    });

    it('should throw error when trying to delete self', async () => {
      await expect(service.deleteUser(userId, userId)).rejects.toThrow(
        CustomHttpException,
      );
    });

    it('should throw error when user not found', async () => {
      mockModelAction.get
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockAdmin);

      await expect(service.deleteUser(userId, deletedBy)).rejects.toThrow(
        CustomHttpException,
      );
    });

    it('should throw error when deletedBy user not found', async () => {
      mockModelAction.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);

      await expect(service.deleteUser(userId, deletedBy)).rejects.toThrow(
        CustomHttpException,
      );
    });

    it('should throw error when user does not have permission', async () => {
      const regularUser = {
        id: '123e4567-e89b-42d3-a456-426614174002',
        email: 'regular@example.com',
        role: UserRole.USER,
      };
      mockModelAction.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(regularUser);

      await expect(service.deleteUser(userId, regularUser.id)).rejects.toThrow(
        CustomHttpException,
      );
    });

    it('should throw error when delete operation fails', async () => {
      mockModelAction.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockAdmin);
      mockModelAction.delete.mockResolvedValueOnce({ affected: 0 });

      await expect(service.deleteUser(userId, deletedBy)).rejects.toThrow(
        CustomHttpException,
      );
    });
  });

  describe('updateUserRole', () => {
    const userId = '123e4567-e89b-42d3-a456-426614174000';
    const updatedBy = '123e4567-e89b-42d3-a456-426614174001';
    const mockUser = {
      id: userId,
      email: 'user@example.com',
      role: UserRole.USER,
    };
    const mockAdmin = {
      id: updatedBy,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    };
    const updatedUser = {
      ...mockUser,
      role: UserRole.ADMIN,
    };

    it('should successfully update user role', async () => {
      mockModelAction.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockAdmin);
      mockModelAction.update.mockResolvedValueOnce(updatedUser);

      const result = await service.updateUserRole(
        userId,
        UserRole.ADMIN,
        updatedBy,
      );

      expect(mockModelAction.get).toHaveBeenCalledTimes(2);
      expect(mockModelAction.update).toHaveBeenCalledWith({
        identifierOptions: { id: userId },
        updatePayload: { role: UserRole.ADMIN },
        transactionOptions: {
          useTransaction: false,
        },
      });
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('User Role Update'),
        data: updatedUser,
      });
    });

    it('should throw error when trying to update own role', async () => {
      await expect(
        service.updateUserRole(userId, UserRole.ADMIN, userId),
      ).rejects.toThrow(CustomHttpException);
    });

    it('should throw error when role is not changing', async () => {
      mockModelAction.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockAdmin);

      await expect(
        service.updateUserRole(userId, UserRole.USER, updatedBy),
      ).rejects.toThrow(CustomHttpException);
    });

    it('should throw error when user not found', async () => {
      mockModelAction.get
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockAdmin);

      await expect(
        service.updateUserRole(userId, UserRole.ADMIN, updatedBy),
      ).rejects.toThrow(CustomHttpException);
    });

    it('should throw error when updatedBy user not found', async () => {
      mockModelAction.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);

      await expect(
        service.updateUserRole(userId, UserRole.ADMIN, updatedBy),
      ).rejects.toThrow(CustomHttpException);
    });

    it('should throw error when user does not have permission', async () => {
      const regularUser = {
        id: '123e4567-e89b-42d3-a456-426614174002',
        email: 'regular@example.com',
        role: UserRole.USER,
      };
      mockModelAction.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(regularUser);

      await expect(
        service.updateUserRole(userId, UserRole.ADMIN, regularUser.id),
      ).rejects.toThrow(CustomHttpException);
    });

    it('should throw error when update operation fails', async () => {
      mockModelAction.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockAdmin);
      mockModelAction.update.mockResolvedValueOnce(null);

      await expect(
        service.updateUserRole(userId, UserRole.ADMIN, updatedBy),
      ).rejects.toThrow(CustomHttpException);
    });

    it('should throw error when trying to update user role to SUPER_ADMIN', async () => {
      mockModelAction.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockAdmin);

      await expect(
        service.updateUserRole(userId, UserRole.SUPER_ADMIN, updatedBy),
      ).rejects.toThrow(CustomHttpException);
    });

    it('should throw error when SUPER_ADMIN tries to promote user to SUPER_ADMIN', async () => {
      const superAdminUser = {
        id: updatedBy,
        email: 'superadmin@example.com',
        role: UserRole.SUPER_ADMIN,
      };

      mockModelAction.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(superAdminUser);

      await expect(
        service.updateUserRole(userId, UserRole.SUPER_ADMIN, updatedBy),
      ).rejects.toThrow(CustomHttpException);
    });
  });
});
