import { CanActivate } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard } from '~/guards/role.guard';
import { UserService } from '../user/user.service';
import { ExportType } from '~/helpers/query.helper';
import { Response, Request } from 'express';
import { AuthGuard } from '~/guards/auth.guard';
import { AdminService } from './admin.service';

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
};

const mockAdminService = {
  listStores: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  exportStores: jest.fn(),
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

  describe('deactivateUser', () => {
    it('should call userService.deactivateUser with correct id and return the expected result', async () => {
      const body = { userId: 'user-123' };
      const req = { user: { sub: 'admin-123' } } as Request & {
        user: { sub: string };
      };
      const expectedResult = {
        message: 'User Deactivation operation successful',
        data: { id: 'user-123', status: 'INACTIVE' },
      };
      mockUserService.deactivateUser.mockResolvedValueOnce(expectedResult);

      const result = await controller.deactivateUser(body, req);

      expect(mockUserService.deactivateUser).toHaveBeenCalledWith(
        'user-123',
        'admin-123',
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from userService.deactivateUser', async () => {
      const body = { userId: 'user-123' };
      const req = { user: { sub: 'admin-123' } } as Request & {
        user: { sub: string };
      };
      const error = new Error('Deactivation failed');
      mockUserService.deactivateUser.mockRejectedValueOnce(error);

      await expect(controller.deactivateUser(body, req)).rejects.toThrow(error);
    });
  });

  describe('reactivateUser', () => {
    it('should call userService.reactivateUser with correct id and return the expected result', async () => {
      const body = { userId: 'user-123' };
      const req = { user: { sub: 'admin-123' } } as Request & {
        user: { sub: string };
      };
      const expectedResult = {
        message: 'User Reactivation operation successful',
        data: { id: 'user-123', status: 'ACTIVE' },
      };
      mockUserService.reactivateUser.mockResolvedValueOnce(expectedResult);

      const result = await controller.reactivateUser(body, req);

      expect(mockUserService.reactivateUser).toHaveBeenCalledWith(
        'user-123',
        'admin-123',
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from userService.reactivateUser', async () => {
      const body = { userId: 'user-123' };
      const req = { user: { sub: 'admin-123' } } as Request & {
        user: { sub: string };
      };
      const error = new Error('Reactivation failed');
      mockUserService.reactivateUser.mockRejectedValueOnce(error);

      await expect(controller.reactivateUser(body, req)).rejects.toThrow(error);
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
      const error = new Error('Export failed');
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
});
