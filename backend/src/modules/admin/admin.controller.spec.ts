import { CanActivate } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminGuard } from '~/guards/super-admin.guard';
import { StoreService } from '../store/store.service';
import {
  ExportType,
  ExportTypeValidator,
  PaginationOptions,
} from '~/helpers/pagination.helper';
import { Response } from 'express';

const mockSuperAdminGuard: CanActivate = {
  canActivate: jest.fn(() => true),
};

const mockStoreService = {
  listStores: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  exportStores: jest.fn(),
  getStoreById: jest.fn().mockResolvedValue({ id: '1', name: 'Test Store' }),
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
          provide: StoreService,
          useValue: mockStoreService,
        },
      ],
    })
      .overrideGuard(SuperAdminGuard)
      .useValue(mockSuperAdminGuard)
      .compile();

    controller = module.get<AdminController>(AdminController);
    storeService = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStores', () => {
    it('should call storeService.listStores with pagination options', async () => {
      const paginationOptions: PaginationOptions = { page: '1', limit: '10' };
      const expectedResult = { data: [], total: 0 };
      mockStoreService.listStores.mockResolvedValueOnce(expectedResult);

      const result = await controller.getStores(paginationOptions);

      expect(storeService.listStores).toHaveBeenCalledWith(paginationOptions);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('exportStores', () => {
    it('should call storeService.exportStores with correct arguments', async () => {
      const paginationOptions: PaginationOptions = { page: '1', limit: '10' };
      const exportTypeOptions: ExportTypeValidator = { type: ExportType.CSV };

      await controller.exportStores(
        mockResponse,
        paginationOptions,
        exportTypeOptions,
      );

      expect(storeService.exportStores).toHaveBeenCalledWith(
        mockResponse,
        paginationOptions,
        exportTypeOptions.type,
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
