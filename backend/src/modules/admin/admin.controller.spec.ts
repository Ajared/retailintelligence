import { CanActivate } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard } from '~/guards/role.guard';
import { StoreService } from '../store/store.service';
import { UserService } from '../user/user.service';
import { ExportType } from '~/helpers/query.helper';
import { Response, Request } from 'express';
import { AuthGuard } from '~/guards/auth.guard';
import { StoreQueryOptions } from '../store/types/list-store.type';

const mockRoleGuard: CanActivate = {
  canActivate: jest.fn(() => true),
};

const mockAuthGuard: CanActivate = {
  canActivate: jest.fn(() => true),
};

const mockStoreService = {
  listStores: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  exportStores: jest.fn(),
  getStoreById: jest.fn().mockResolvedValue({ id: '1', name: 'Test Store' }),
};

const mockUserService = {
  deactivateUser: jest.fn().mockResolvedValue(undefined),
  reactivateUser: jest.fn().mockResolvedValue(undefined),
};

const mockResponse = {
  setHeader: jest.fn(),
  send: jest.fn(),
} as unknown as Response;

describe('AdminController', () => {
  let controller: AdminController;
  let storeService: StoreService;

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
          provide: StoreService,
          useValue: mockStoreService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RoleGuard)
      .useValue(mockRoleGuard)
      .compile();

    controller = module.get<AdminController>(AdminController);
    storeService = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deactivateUser', () => {
    it('should call userService.deactivateUser with correct id and return the expected result', async () => {
      const body = { userId: 'user-123' };
      const req = { user: { sub: 'admin-123' } } as Request;
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
      const req = { user: { sub: 'admin-123' } } as Request;
      const error = new Error('Deactivation failed');
      mockUserService.deactivateUser.mockRejectedValueOnce(error);

      await expect(controller.deactivateUser(body, req)).rejects.toThrow(error);
    });
  });

  describe('reactivateUser', () => {
    it('should call userService.reactivateUser with correct id and return the expected result', async () => {
      const body = { userId: 'user-123' };
      const req = { user: { sub: 'admin-123' } } as Request;
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
      const req = { user: { sub: 'admin-123' } } as Request;
      const error = new Error('Reactivation failed');
      mockUserService.reactivateUser.mockRejectedValueOnce(error);

      await expect(controller.reactivateUser(body, req)).rejects.toThrow(error);
    });
  });

  describe('getStores', () => {
    it('should call storeService.listStores with pagination options', async () => {
      const queryOptions: StoreQueryOptions = { page: '1', limit: '10' };
      const expectedResult = { data: [], total: 0 };
      mockStoreService.listStores.mockResolvedValueOnce(expectedResult);

      const result = await controller.getStores(queryOptions);

      expect(storeService.listStores).toHaveBeenCalledWith(queryOptions);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('exportStores', () => {
    it('should call storeService.exportStores with correct arguments', async () => {
      const queryOptions = { exportType: ExportType.CSV };

      await controller.exportStores(mockResponse, queryOptions);

      expect(storeService.exportStores).toHaveBeenCalledWith(
        mockResponse,
        queryOptions,
      );
    });
  });

  describe('getStoreById', () => {
    it('should call storeService.getStoreById with the correct id', async () => {
      const storeId = 'test-id-123';
      const expectedStore = { id: storeId, name: 'Test Store' };
      mockStoreService.getStoreById.mockResolvedValueOnce(expectedStore);

      const result = await controller.getStoreById(storeId);

      expect(storeService.getStoreById).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(expectedStore);
    });
  });
});
