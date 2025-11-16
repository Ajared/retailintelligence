import { CanActivate } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard } from '~/guards/role.guard';
import { UserService } from '../user/user.service';
import { ExportType } from '~/helpers/query.helper';
import { Response, Request } from 'express';
import { AuthGuard } from '~/guards/auth.guard';
import { AdminService } from './admin.service';
import * as SYS_MSG from '~/helpers/system-messages';

const mockRoleGuard: CanActivate = {
  canActivate: jest.fn(() => true),
};

const mockAuthGuard: CanActivate = {
  canActivate: jest.fn(() => true),
};

const mockUserService = {
  deactivateUser: jest.fn().mockResolvedValue(undefined),
  reactivateUser: jest.fn().mockResolvedValue(undefined),
  listUsers: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  assignLocationToUser: jest.fn().mockResolvedValue(undefined),
  deleteUser: jest.fn().mockResolvedValue(undefined),
  updateUserRole: jest.fn().mockResolvedValue(undefined),
  verifyUser: jest.fn().mockResolvedValue(undefined),
  verifyUsersBulk: jest.fn().mockResolvedValue(undefined),
};

const mockAdminService = {
  listStores: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  exportStores: jest.fn().mockResolvedValue(undefined),
  getStoreById: jest.fn().mockResolvedValue({ id: '1', name: 'Test Store' }),
};

const mockResponse = {
  setHeader: jest.fn(),
  send: jest.fn(),
  write: jest.fn(),
  end: jest.fn(),
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  flushHeaders: jest.fn(),
  writableEnded: false,
  headersSent: false,
} as unknown as Response;

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RoleGuard)
      .useValue(mockRoleGuard)
      .compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('assignLocation', () => {
    it('should call userService.assignLocationToUser with correct arguments and return the expected result', async () => {
      const userId = 'user-123';
      const assignLocationDto = {
        stateId: 'state-1',
        localGovernmentId: 'lg-1',
        phaseId: 'phase-1',
        districtId: 'district-1',
      };
      const expectedResult = {
        message: 'Location Assignment operation successful',
        data: { userId: 'user-123', ...assignLocationDto },
      };
      mockUserService.assignLocationToUser.mockResolvedValueOnce(
        expectedResult,
      );

      const result = await controller.assignLocation(userId, assignLocationDto);

      expect(mockUserService.assignLocationToUser).toHaveBeenCalledWith(
        userId,
        assignLocationDto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from userService.assignLocationToUser', async () => {
      const userId = 'user-123';
      const assignLocationDto = {
        stateId: 'state-1',
        localGovernmentId: 'lg-1',
        phaseId: 'phase-1',
        districtId: 'district-1',
      };
      const error = new Error('Location assignment failed');
      mockUserService.assignLocationToUser.mockRejectedValueOnce(error);

      await expect(
        controller.assignLocation(userId, assignLocationDto),
      ).rejects.toThrow(error);
    });
  });

  describe('deactivateUser', () => {
    it('should call userService.deactivateUser with correct id and return the expected result', async () => {
      const userId = 'user-123';
      const req = { user: { sub: 'admin-123' } } as Request & {
        user: { sub: string };
      };
      const expectedResult = {
        message: 'User Deactivation operation successful',
        data: { id: 'user-123', status: 'INACTIVE' },
      };
      mockUserService.deactivateUser.mockResolvedValueOnce(expectedResult);

      const result = await controller.deactivateUser(userId, req);

      expect(mockUserService.deactivateUser).toHaveBeenCalledWith(
        'user-123',
        'admin-123',
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from userService.deactivateUser', async () => {
      const userId = 'user-123';
      const req = { user: { sub: 'admin-123' } } as Request & {
        user: { sub: string };
      };
      const error = new Error('Deactivation failed');
      mockUserService.deactivateUser.mockRejectedValueOnce(error);

      await expect(controller.deactivateUser(userId, req)).rejects.toThrow(
        error,
      );
    });
  });

  describe('reactivateUser', () => {
    it('should call userService.reactivateUser with correct id and return the expected result', async () => {
      const userId = 'user-123';
      const req = { user: { sub: 'admin-123' } } as Request & {
        user: { sub: string };
      };
      const expectedResult = {
        message: 'User Reactivation operation successful',
        data: { id: 'user-123', status: 'ACTIVE' },
      };
      mockUserService.reactivateUser.mockResolvedValueOnce(expectedResult);

      const result = await controller.reactivateUser(userId, req);

      expect(mockUserService.reactivateUser).toHaveBeenCalledWith(
        'user-123',
        'admin-123',
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from userService.reactivateUser', async () => {
      const userId = 'user-123';
      const req = { user: { sub: 'admin-123' } } as Request & {
        user: { sub: string };
      };
      const error = new Error('Reactivation failed');
      mockUserService.reactivateUser.mockRejectedValueOnce(error);

      await expect(controller.reactivateUser(userId, req)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getUsers', () => {
    it('should call userService.listUsers with query parameters', async () => {
      const query = { page: '1', limit: '10' };
      const expectedResult = { data: [], total: 0 };
      mockUserService.listUsers.mockResolvedValueOnce(expectedResult);

      const result = await controller.getUsers(query);

      expect(mockUserService.listUsers).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from userService.listUsers', async () => {
      const query = { page: '1', limit: '10' };
      const error = new Error('Failed to fetch users');
      mockUserService.listUsers.mockRejectedValueOnce(error);

      await expect(controller.getUsers(query)).rejects.toThrow(error);
    });
  });

  describe('getStores', () => {
    it('should call adminService.listStores with query options', async () => {
      const queryOptions = { page: '1', limit: '10' };
      const expectedResult = { data: [], total: 0 };
      mockAdminService.listStores.mockResolvedValueOnce(expectedResult);

      const result = await controller.getStores(queryOptions);

      expect(mockAdminService.listStores).toHaveBeenCalledWith(queryOptions);
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from adminService.listStores', async () => {
      const queryOptions = { page: '1', limit: '10' };
      const error = new Error('Failed to fetch stores');
      mockAdminService.listStores.mockRejectedValueOnce(error);

      await expect(controller.getStores(queryOptions)).rejects.toThrow(error);
    });
  });

  describe('exportStores', () => {
    it('should call adminService.exportStores with correct arguments', async () => {
      const queryOptions = { exportType: ExportType.CSV };

      await controller.exportStores(mockResponse, queryOptions);

      expect(mockAdminService.exportStores).toHaveBeenCalledWith(
        mockResponse,
        queryOptions,
      );
    });

    it('should handle errors from adminService.exportStores', async () => {
      const queryOptions = { exportType: ExportType.CSV };
      const error = new Error(SYS_MSG.RESOURCE_EXPORT_FAILED('Stores'));
      mockAdminService.exportStores.mockRejectedValueOnce(error);

      await expect(
        controller.exportStores(mockResponse, queryOptions),
      ).rejects.toThrow(error);
    });
  });

  describe('getStoreById', () => {
    it('should call adminService.getStoreById with the correct id', async () => {
      const storeId = 'test-id-123';
      const expectedStore = { id: storeId, name: 'Test Store' };
      mockAdminService.getStoreById.mockResolvedValueOnce(expectedStore);

      const result = await controller.getStoreById(storeId);

      expect(mockAdminService.getStoreById).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(expectedStore);
    });

    it('should handle errors from adminService.getStoreById', async () => {
      const storeId = 'test-id-123';
      const error = new Error('Failed to fetch store');
      mockAdminService.getStoreById.mockRejectedValueOnce(error);

      await expect(controller.getStoreById(storeId)).rejects.toThrow(error);
    });
  });

  describe('deleteUser', () => {
    it('should call userService.deleteUser with correct id and return the expected result', async () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const req = {
        user: { sub: '123e4567-e89b-42d3-a456-426614174001' },
      } as Request & {
        user: { sub: string };
      };
      const expectedResult = {
        message: 'User Deletion operation successful',
      };
      mockUserService.deleteUser.mockResolvedValueOnce(expectedResult);

      const result = await controller.deleteUser(userId, req);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(
        userId,
        req.user.sub,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from userService.deleteUser', async () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const req = {
        user: { sub: '123e4567-e89b-42d3-a456-426614174001' },
      } as Request & {
        user: { sub: string };
      };
      const error = new Error('Deletion failed');
      mockUserService.deleteUser.mockRejectedValueOnce(error);

      await expect(controller.deleteUser(userId, req)).rejects.toThrow(error);
    });
  });

  describe('updateUserRole', () => {
    it('should call userService.updateUserRole with correct arguments and return the expected result', async () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const updateUserRoleDto = { role: 'admin' as any };
      const req = {
        user: { sub: '123e4567-e89b-42d3-a456-426614174001' },
      } as Request & {
        user: { sub: string };
      };
      const expectedResult = {
        message: 'User Role Update operation successful',
        data: { id: userId, role: 'admin' },
      };
      mockUserService.updateUserRole.mockResolvedValueOnce(expectedResult);

      const result = await controller.updateUserRole(
        userId,
        updateUserRoleDto,
        req,
      );

      expect(mockUserService.updateUserRole).toHaveBeenCalledWith(
        userId,
        'admin',
        req.user.sub,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from userService.updateUserRole', async () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const updateUserRoleDto = { role: 'admin' as any };
      const req = {
        user: { sub: '123e4567-e89b-42d3-a456-426614174001' },
      } as Request & {
        user: { sub: string };
      };
      const error = new Error('Role update failed');
      mockUserService.updateUserRole.mockRejectedValueOnce(error);

      await expect(
        controller.updateUserRole(userId, updateUserRoleDto, req),
      ).rejects.toThrow(error);
    });
  });
});
