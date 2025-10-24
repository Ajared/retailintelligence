import { Test, TestingModule } from '@nestjs/testing';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { StoreModelAction } from './store.model-action';
import { Request } from 'express';
import { StoreDto } from './dto/store.dto';
import * as SYS_MSG from '~/helpers/system-messages';

describe('StoreController', () => {
  let controller: StoreController;
  let storeService: StoreService;

  const mockStore = {
    id: '1',
    name: 'Test Store',
    address: '123 Main St',
    storeType: 'SHOP' as const,
    storeTypeDescription: 'Electronics store',
    latitude: 123.456,
    longitude: 78.901,
    localGovernmentId: '1',
    stateId: '1',
    enumeratorId: '1',
  };

  const mockRequest = {
    user: { sub: 'user-123' },
  } as Request & { user: { sub: string } };

  beforeEach(async () => {
    const mockStoreModelAction = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      list: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [
        StoreService,
        {
          provide: StoreModelAction,
          useValue: mockStoreModelAction,
        },
      ],
    }).compile();

    controller = module.get<StoreController>(StoreController);
    storeService = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createStore', () => {
    it('should create a store successfully', async () => {
      const storeDto: Omit<StoreDto, 'enumeratorId'> = {
        name: 'Test Store',
        address: '123 Main St',
        storeType: 'SHOP',
        storeTypeDescription: 'Electronics store',
        latitude: 123.456,
        longitude: 78.901,
        localGovernmentId: '1',
        stateId: '1',
      };

      const expectedResult = {
        data: mockStore,
        message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('Store'),
      };

      jest.spyOn(storeService, 'createStore').mockResolvedValue(expectedResult);

      const result = await controller.createStore(storeDto, mockRequest);

      expect(storeService.createStore).toHaveBeenCalledWith(
        mockRequest.user.sub,
        storeDto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from storeService.createStore', async () => {
      const storeDto: Omit<StoreDto, 'enumeratorId'> = {
        name: 'Test Store',
        address: '123 Main St',
        storeType: 'HOSPITAL',
        latitude: 123.456,
        longitude: 78.901,
        localGovernmentId: '1',
        stateId: '1',
      };

      const error = new Error('Creation failed');
      jest.spyOn(storeService, 'createStore').mockRejectedValue(error);

      await expect(
        controller.createStore(storeDto, mockRequest),
      ).rejects.toThrow(error);
    });
  });

  describe('getStoreById', () => {
    it('should return store data when store exists', async () => {
      const storeId = '1';
      const expectedResult = {
        data: mockStore,
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Store'),
      };

      jest
        .spyOn(storeService, 'getStoreById')
        .mockResolvedValue(expectedResult);

      const result = await controller.getStoreById(storeId, mockRequest);

      expect(storeService.getStoreById).toHaveBeenCalledWith(
        storeId,
        mockRequest.user.sub,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from storeService.getStoreById', async () => {
      const storeId = '1';
      const error = new Error('Store not found');
      jest.spyOn(storeService, 'getStoreById').mockRejectedValue(error);

      await expect(
        controller.getStoreById(storeId, mockRequest),
      ).rejects.toThrow(error);
    });
  });

  describe('listStores', () => {
    it('should return list of stores with pagination', async () => {
      const queryOptions = { page: '1', limit: '10' };
      const expectedResult = {
        data: [mockStore],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Stores'),
      };

      jest.spyOn(storeService, 'listStores').mockResolvedValue(expectedResult);

      const result = await controller.listStores(mockRequest, queryOptions);

      expect(storeService.listStores).toHaveBeenCalledWith(
        mockRequest.user.sub,
        queryOptions,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from storeService.listStores', async () => {
      const queryOptions = { page: '1', limit: '10' };
      const error = new Error('Failed to fetch stores');
      jest.spyOn(storeService, 'listStores').mockRejectedValue(error);

      await expect(
        controller.listStores(mockRequest, queryOptions),
      ).rejects.toThrow(error);
    });
  });

  describe('updateStore', () => {
    it('should update store successfully', async () => {
      const storeId = '1';
      const storeDto: Partial<StoreDto> = {
        name: 'Updated Store',
        address: '456 New St',
      };

      const expectedResult = {
        data: { ...mockStore, ...storeDto },
        message: SYS_MSG.RESOURCE_UPDATED_SUCCESSFULLY('Store'),
      };

      jest.spyOn(storeService, 'updateStore').mockResolvedValue(expectedResult);

      const result = await controller.updateStore(
        storeId,
        storeDto,
        mockRequest,
      );

      expect(storeService.updateStore).toHaveBeenCalledWith(
        storeId,
        mockRequest.user.sub,
        storeDto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from storeService.updateStore', async () => {
      const storeId = '1';
      const storeDto: Partial<StoreDto> = {
        name: 'Updated Store',
        address: '456 New St',
      };

      const error = new Error('Update failed');
      jest.spyOn(storeService, 'updateStore').mockRejectedValue(error);

      await expect(
        controller.updateStore(storeId, storeDto, mockRequest),
      ).rejects.toThrow(error);
    });
  });
});
