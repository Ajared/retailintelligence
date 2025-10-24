import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from './store.service';
import { StoreModelAction } from './store.model-action';
import { StoreDto } from './dto/store.dto';
import { Response } from 'express';
import { NullishValueError } from '~/helpers/try-safe';
import { CustomHttpException } from '~/helpers/custom.exception';
import { HttpStatus } from '@nestjs/common';
import {
  EntityMetadata,
  EntityPropertyNotFoundError,
  Repository,
  ILike,
  Between,
} from 'typeorm';
import { Store } from './entities/store.entity';
import { StoreQueryOptions } from './types/list-store.type';
import { UserRole, UserStatus } from '../user/constants/user.constant';
import { AuthProvider } from '../auth/constants/auth.constant';
import * as SYS_MSG from '~/helpers/system-messages';
import { ExportType } from '~/helpers/query.helper';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('StoreService', () => {
  let service: StoreService;
  let storeModelAction: StoreModelAction;
  let mockRepository: jest.Mocked<Repository<Store>>;

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
    on: jest.fn().mockReturnThis(),
    once: jest.fn().mockReturnThis(),
    emit: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const mockStore: Store = {
    id: '1',
    name: 'Test Store',
    address: '123 Main St',
    storeType: 'SHOP' as const,
    storeTypeDescription: 'Electronics store',
    latitude: 123.456,
    longitude: 78.901,
    localGovernment: {
      name: 'Test Local Government',
      state: {
        name: 'Test State',
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        stores: [],
        localGovernments: [],
      },
      stateId: '1',
      stores: [],
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    localGovernmentId: '1',
    state: {
      name: 'Test State',
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      stores: [],
      localGovernments: [],
    },
    stateId: '1',
    enumerator: {
      email: 'test@example.com',
      password: 'password',
      role: UserRole.USER,
      status: UserStatus.VERIFIED,
      authProvider: AuthProvider.LOCAL,
      stores: [],
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    enumeratorId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginationMeta = {
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  };

  beforeEach(async () => {
    const mockStoreModelAction = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      list: jest.fn(),
    };

    const mockRepositoryMethods = {
      find: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: StoreModelAction,
          useValue: mockStoreModelAction,
        },
        {
          provide: getRepositoryToken(Store),
          useValue: mockRepositoryMethods,
        },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
    storeModelAction = module.get<StoreModelAction>(StoreModelAction);
    mockRepository = module.get<Repository<Store>>(
      getRepositoryToken(Store),
    ) as jest.Mocked<Repository<Store>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      const enumeratorId = '1';

      jest.spyOn(storeModelAction, 'create').mockResolvedValue(mockStore);

      const result = await service.createStore(enumeratorId, storeDto);

      expect(storeModelAction.create).toHaveBeenCalledWith({
        createPayload: { ...storeDto, enumeratorId },
        transactionOptions: { useTransaction: false },
      });
      expect(result).toEqual({
        data: mockStore,
        message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('Store'),
      });
    });

    it('should throw CustomHttpException when store creation fails', async () => {
      const storeDto: Omit<StoreDto, 'enumeratorId'> = {
        name: 'Test Store',
        address: '123 Main St',
        storeType: 'HOSPITAL',
        latitude: 123.456,
        longitude: 78.901,
        localGovernmentId: '1',
        stateId: '1',
      };
      const enumeratorId = '1';

      jest
        .spyOn(storeModelAction, 'create')
        .mockRejectedValue(new Error('Creation failed'));

      await expect(service.createStore(enumeratorId, storeDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(
        service.createStore(enumeratorId, storeDto),
      ).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: SYS_MSG.RESOURCE_CREATION_FAILED('Store'),
      });
    });

    it('should throw error when SHOP store type is provided without description', async () => {
      const storeDto: Omit<StoreDto, 'enumeratorId'> = {
        name: 'Test Store',
        address: '123 Main St',
        storeType: 'SHOP',
        latitude: 123.456,
        longitude: 78.901,
        localGovernmentId: '1',
        stateId: '1',
      };
      const enumeratorId = '1';

      await expect(service.createStore(enumeratorId, storeDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(
        service.createStore(enumeratorId, storeDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
        message:
          'Store type description is required when store type is SHOP or OTHER',
      });
    });

    it('should throw error when OTHER store type is provided without description', async () => {
      const storeDto: Omit<StoreDto, 'enumeratorId'> = {
        name: 'Test Store',
        address: '123 Main St',
        storeType: 'OTHER',
        latitude: 123.456,
        longitude: 78.901,
        localGovernmentId: '1',
        stateId: '1',
      };
      const enumeratorId = '1';

      await expect(service.createStore(enumeratorId, storeDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(
        service.createStore(enumeratorId, storeDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
        message:
          'Store type description is required when store type is SHOP or OTHER',
      });
    });

    it('should throw error when SHOP store type has empty string description', async () => {
      const storeDto: Omit<StoreDto, 'enumeratorId'> = {
        name: 'Test Store',
        address: '123 Main St',
        storeType: 'SHOP',
        storeTypeDescription: '   ', // whitespace only
        latitude: 123.456,
        longitude: 78.901,
        localGovernmentId: '1',
        stateId: '1',
      };
      const enumeratorId = '1';

      await expect(service.createStore(enumeratorId, storeDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(
        service.createStore(enumeratorId, storeDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
        message:
          'Store type description is required when store type is SHOP or OTHER',
      });
    });

    it('should throw error when OTHER store type has empty string description', async () => {
      const storeDto: Omit<StoreDto, 'enumeratorId'> = {
        name: 'Test Store',
        address: '123 Main St',
        storeType: 'OTHER',
        storeTypeDescription: '', // empty string
        latitude: 123.456,
        longitude: 78.901,
        localGovernmentId: '1',
        stateId: '1',
      };
      const enumeratorId = '1';

      await expect(service.createStore(enumeratorId, storeDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(
        service.createStore(enumeratorId, storeDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
        message:
          'Store type description is required when store type is SHOP or OTHER',
      });
    });

    it('should create store successfully when SHOP store type has description', async () => {
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
      const enumeratorId = '1';

      jest.spyOn(storeModelAction, 'create').mockResolvedValue(mockStore);

      const result = await service.createStore(enumeratorId, storeDto);

      expect(storeModelAction.create).toHaveBeenCalledWith({
        createPayload: { ...storeDto, enumeratorId },
        transactionOptions: { useTransaction: false },
      });
      expect(result).toEqual({
        data: mockStore,
        message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('Store'),
      });
    });

    it('should create store successfully when OTHER store type has description', async () => {
      const storeDto: Omit<StoreDto, 'enumeratorId'> = {
        name: 'Test Store',
        address: '123 Main St',
        storeType: 'OTHER',
        storeTypeDescription: 'Custom business type',
        latitude: 123.456,
        longitude: 78.901,
        localGovernmentId: '1',
        stateId: '1',
      };
      const enumeratorId = '1';

      jest.spyOn(storeModelAction, 'create').mockResolvedValue(mockStore);

      const result = await service.createStore(enumeratorId, storeDto);

      expect(storeModelAction.create).toHaveBeenCalledWith({
        createPayload: { ...storeDto, enumeratorId },
        transactionOptions: { useTransaction: false },
      });
      expect(result).toEqual({
        data: mockStore,
        message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('Store'),
      });
    });

    it('should create store successfully when non-SHOP/OTHER store type is provided without description', async () => {
      const storeDto: Omit<StoreDto, 'enumeratorId'> = {
        name: 'Test Store',
        address: '123 Main St',
        storeType: 'HOSPITAL',
        latitude: 123.456,
        longitude: 78.901,
        localGovernmentId: '1',
        stateId: '1',
      };
      const enumeratorId = '1';

      jest.spyOn(storeModelAction, 'create').mockResolvedValue(mockStore);

      const result = await service.createStore(enumeratorId, storeDto);

      expect(storeModelAction.create).toHaveBeenCalledWith({
        createPayload: { ...storeDto, enumeratorId },
        transactionOptions: { useTransaction: false },
      });
      expect(result).toEqual({
        data: mockStore,
        message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('Store'),
      });
    });
  });

  describe('getStoreById', () => {
    it('should return store data when store exists', async () => {
      const storeId = '1';
      const userId = '1';

      jest.spyOn(storeModelAction, 'get').mockResolvedValue(mockStore);

      const result = await service.getStoreById(storeId, userId);

      expect(storeModelAction.get).toHaveBeenCalledWith(
        { id: storeId },
        { userId },
        {
          state: true,
          enumerator: true,
          localGovernment: true,
          phase: true,
          district: true,
        },
      );
      expect(result).toEqual({
        data: mockStore,
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Store'),
      });
    });

    it('should throw CustomHttpException when store is not found', async () => {
      const storeId = '1';
      const userId = '1';

      jest
        .spyOn(storeModelAction, 'get')
        .mockRejectedValue(new NullishValueError());

      await expect(service.getStoreById(storeId, userId)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.getStoreById(storeId, userId)).rejects.toMatchObject(
        {
          status: HttpStatus.NOT_FOUND,
          message: SYS_MSG.RESOURCE_NOT_FOUND('Store'),
        },
      );
    });

    it('should throw CustomHttpException when store fetch fails', async () => {
      const storeId = '1';
      const userId = '1';

      jest
        .spyOn(storeModelAction, 'get')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.getStoreById(storeId, userId)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.getStoreById(storeId, userId)).rejects.toMatchObject(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: SYS_MSG.RESOURCE_FETCH_FAILED('Store'),
        },
      );
    });
  });

  describe('listStores', () => {
    it('should return list of stores with pagination', async () => {
      const userId = '1';
      const queryOptions: StoreQueryOptions = { page: '1', limit: '10' };

      const mockStores = {
        payload: [mockStore],
        paginationMeta: mockPaginationMeta,
      };
      jest.spyOn(storeModelAction, 'list').mockResolvedValue(mockStores);

      const result = await service.listStores(userId, queryOptions);

      expect(storeModelAction.list).toHaveBeenCalledWith({
        paginationPayload: { page: 1, limit: 10 },
        filterRecordOptions: { enumeratorId: userId },
        relations: {
          state: true,
          enumerator: true,
          localGovernment: true,
          phase: true,
          district: true,
        },
      });
      expect(result).toEqual({
        data: mockStores.payload,
        meta: mockStores.paginationMeta,
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Stores'),
      });
    });

    it('should throw CustomHttpException when invalid filter parameter is provided', async () => {
      const userId = '1';
      const invalidQuery = {
        page: '1',
        limit: '10',
        unknownField: 'value',
      } as unknown as StoreQueryOptions;

      jest
        .spyOn(storeModelAction, 'list')
        .mockRejectedValue(
          new EntityPropertyNotFoundError(
            'fieldName',
            {} as unknown as EntityMetadata,
          ),
        );

      await expect(service.listStores(userId, invalidQuery)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(
        service.listStores(userId, invalidQuery),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
        message: SYS_MSG.INVALID_PARAMETER('Filter Query'),
      });
    });

    it('should throw CustomHttpException when store list fetch fails', async () => {
      const userId = '1';
      const queryOptions: StoreQueryOptions = { page: '1', limit: '10' };

      jest
        .spyOn(storeModelAction, 'list')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.listStores(userId, queryOptions)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(
        service.listStores(userId, queryOptions),
      ).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: SYS_MSG.RESOURCE_FETCH_FAILED('Stores'),
      });
    });
  });

  describe('updateStore', () => {
    it('should update store successfully', async () => {
      const storeId = '1';
      const userId = '1';
      const storeDto: Partial<StoreDto> = {
        name: 'Updated Store',
        address: '456 New St',
        storeType: 'HOSPITAL',
        latitude: 123.456,
        longitude: 78.901,
        localGovernmentId: '1',
        stateId: '1',
      };

      jest.spyOn(storeModelAction, 'update').mockResolvedValue({
        ...mockStore,
        ...storeDto,
      });

      const result = await service.updateStore(storeId, userId, storeDto);

      expect(storeModelAction.update).toHaveBeenCalledWith({
        identifierOptions: { id: storeId, enumeratorId: userId },
        updatePayload: storeDto,
        transactionOptions: { useTransaction: false },
      });
      expect(result).toEqual({
        data: { ...mockStore, ...storeDto },
        message: SYS_MSG.RESOURCE_UPDATED_SUCCESSFULLY('Store'),
      });
    });

    it('should throw CustomHttpException when store update fails', async () => {
      const storeId = '1';
      const userId = '1';
      const storeDto: Partial<StoreDto> = {
        name: 'Updated Store',
        address: '456 New St',
        storeType: 'HOSPITAL',
        latitude: 123.456,
        longitude: 78.901,
        localGovernmentId: '1',
        stateId: '1',
      };

      jest
        .spyOn(storeModelAction, 'update')
        .mockRejectedValue(new Error('Update failed'));

      await expect(
        service.updateStore(storeId, userId, storeDto),
      ).rejects.toThrow(CustomHttpException);
      await expect(
        service.updateStore(storeId, userId, storeDto),
      ).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: SYS_MSG.RESOURCE_UPDATE_FAILED('Store'),
      });
    });

    it('should throw error when updating to SHOP store type without description', async () => {
      const storeId = '1';
      const userId = '1';
      const storeDto: Partial<StoreDto> = {
        storeType: 'SHOP',
      };

      await expect(
        service.updateStore(storeId, userId, storeDto),
      ).rejects.toThrow(CustomHttpException);
      await expect(
        service.updateStore(storeId, userId, storeDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
        message:
          'Store type description is required when store type is SHOP or OTHER',
      });
    });

    it('should throw error when updating to OTHER store type without description', async () => {
      const storeId = '1';
      const userId = '1';
      const storeDto: Partial<StoreDto> = {
        storeType: 'OTHER',
      };

      await expect(
        service.updateStore(storeId, userId, storeDto),
      ).rejects.toThrow(CustomHttpException);
      await expect(
        service.updateStore(storeId, userId, storeDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
        message:
          'Store type description is required when store type is SHOP or OTHER',
      });
    });

    it('should update store successfully when SHOP store type has description', async () => {
      const storeId = '1';
      const userId = '1';
      const storeDto: Partial<StoreDto> = {
        storeType: 'SHOP',
        storeTypeDescription: 'Electronics store',
      };

      jest.spyOn(storeModelAction, 'update').mockResolvedValue({
        ...mockStore,
        ...storeDto,
      });

      const result = await service.updateStore(storeId, userId, storeDto);

      expect(storeModelAction.update).toHaveBeenCalledWith({
        identifierOptions: { id: storeId, enumeratorId: userId },
        updatePayload: storeDto,
        transactionOptions: { useTransaction: false },
      });
      expect(result).toEqual({
        data: { ...mockStore, ...storeDto },
        message: SYS_MSG.RESOURCE_UPDATED_SUCCESSFULLY('Store'),
      });
    });

    it('should update store successfully when OTHER store type has description', async () => {
      const storeId = '1';
      const userId = '1';
      const storeDto: Partial<StoreDto> = {
        storeType: 'OTHER',
        storeTypeDescription: 'Custom business type',
      };

      jest.spyOn(storeModelAction, 'update').mockResolvedValue({
        ...mockStore,
        ...storeDto,
      });

      const result = await service.updateStore(storeId, userId, storeDto);

      expect(storeModelAction.update).toHaveBeenCalledWith({
        identifierOptions: { id: storeId, enumeratorId: userId },
        updatePayload: storeDto,
        transactionOptions: { useTransaction: false },
      });
      expect(result).toEqual({
        data: { ...mockStore, ...storeDto },
        message: SYS_MSG.RESOURCE_UPDATED_SUCCESSFULLY('Store'),
      });
    });

    it('should update store successfully when non-SHOP/OTHER store type is provided without description', async () => {
      const storeId = '1';
      const userId = '1';
      const storeDto: Partial<StoreDto> = {
        storeType: 'HOSPITAL',
      };

      jest.spyOn(storeModelAction, 'update').mockResolvedValue({
        ...mockStore,
        ...storeDto,
      });

      const result = await service.updateStore(storeId, userId, storeDto);

      expect(storeModelAction.update).toHaveBeenCalledWith({
        identifierOptions: { id: storeId, enumeratorId: userId },
        updatePayload: storeDto,
        transactionOptions: { useTransaction: false },
      });
      expect(result).toEqual({
        data: { ...mockStore, ...storeDto },
        message: SYS_MSG.RESOURCE_UPDATED_SUCCESSFULLY('Store'),
      });
    });
  });

  describe('exportStores', () => {
    it('should export stores as JSON', async () => {
      const mockStores = {
        payload: [mockStore],
        paginationMeta: mockPaginationMeta,
      };
      jest.spyOn(storeModelAction, 'list').mockResolvedValue(mockStores);

      await service.exportStores(
        mockResponse,
        { exportType: ExportType.JSON },
        '1',
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json',
      );
      expect(mockResponse.write).toHaveBeenCalledWith(
        JSON.stringify(mockStores.payload, null, 2),
      );
    });

    it('should export stores as CSV', async () => {
      const mockStores = {
        payload: [mockStore],
        paginationMeta: mockPaginationMeta,
      };
      jest.spyOn(storeModelAction, 'list').mockResolvedValue(mockStores);

      await service.exportStores(
        mockResponse,
        { exportType: ExportType.CSV },
        '1',
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv',
      );
    });

    it('should export stores as Excel', async () => {
      const mockStores = {
        payload: [mockStore],
        paginationMeta: mockPaginationMeta,
      };
      jest.spyOn(storeModelAction, 'list').mockResolvedValue(mockStores);

      await service.exportStores(
        mockResponse,
        {
          exportType: ExportType.EXCEL,
        },
        '1',
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should handle empty store list', async () => {
      const mockStores = {
        payload: [],
        paginationMeta: {
          ...mockPaginationMeta,
          total: 0,
        },
      };
      jest.spyOn(storeModelAction, 'list').mockResolvedValue(mockStores);

      await service.exportStores(
        mockResponse,
        { exportType: ExportType.JSON },
        '1',
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.send).toHaveBeenCalledWith(
        SYS_MSG.RESOURCE_NOT_FOUND('Stores'),
      );
    });

    it('should handle export errors', async () => {
      jest
        .spyOn(storeModelAction, 'list')
        .mockRejectedValue(new Error(SYS_MSG.RESOURCE_EXPORT_FAILED('Stores')));

      await service.exportStores(
        mockResponse,
        { exportType: ExportType.JSON },
        '1',
      );

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: SYS_MSG.RESOURCE_EXPORT_FAILED('Stores'),
          message: SYS_MSG.RESOURCE_FETCH_FAILED('Stores'),
        }),
      );
    });
  });

  describe('StoreModelAction - Partial Search Tests', () => {
    let modelAction: StoreModelAction;

    beforeEach(() => {
      modelAction = new StoreModelAction(mockRepository);
    });

    describe('list - partial search functionality', () => {
      it('should perform exact match for non-name fields', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: {
            stateId: 'state1',
            enumeratorId: 'user1',
          },
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            stateId: 'state1',
            enumeratorId: 'user1',
          },
          relations: undefined,
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        });
      });

      it('should perform case-insensitive partial search for name field', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: {
            name: 'Test',
            stateId: 'state1',
          },
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            name: ILike('%Test%'),
            stateId: 'state1',
          },
          relations: undefined,
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        });

        expect(mockRepository.count).toHaveBeenCalledWith({
          where: {
            name: ILike('%Test%'),
            stateId: 'state1',
          },
        });
      });

      it('should handle partial name search with special characters', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: {
            name: 'Store & Shop',
          },
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            name: ILike('%Store & Shop%'),
          },
          relations: undefined,
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        });
      });

      it('should ignore undefined and null values in filter', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: {
            name: 'Test',
            stateId: undefined,
            localGovernmentId: null,
          },
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            name: ILike('%Test%'),
          },
          relations: undefined,
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        });
      });

      it('should work without pagination', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);

        const listOptions = {
          filterRecordOptions: {
            name: 'Test Store',
          },
        };

        const result = await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            name: ILike('%Test Store%'),
          },
          relations: undefined,
          order: { createdAt: 'DESC' },
        });

        expect(result).toEqual({
          payload: stores,
          paginationMeta: {
            total: 1,
            page: 1,
            limit: 1,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        });
      });

      it('should work with empty name string', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: {
            name: '',
            stateId: 'state1',
          },
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            name: ILike('%%'),
            stateId: 'state1',
          },
          relations: undefined,
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        });
      });

      it('should handle sorting with partial search', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: {
            name: 'Test',
            stateId: 'state1',
            sort: 'ASC' as const,
          },
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            name: ILike('%Test%'),
            stateId: 'state1',
          },
          relations: undefined,
          take: 10,
          skip: 0,
          order: { stateId: 'ASC' },
        });
      });

      it('should fall back to parent implementation when no filter options', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: undefined,
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          relations: undefined,
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        });
      });

      it('should handle geographic bounds filtering for lat/lng viewport', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: {
            minLat: '9.070992170693003',
            maxLat: '9.089723037902536',
            minLng: '7.464008331298829',
            maxLng: '7.497739791870118',
          },
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            latitude: Between(9.070992170693003, 9.089723037902536),
            longitude: Between(7.464008331298829, 7.497739791870118),
          },
          relations: undefined,
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        });
      });

      it('should handle combined name search and geographic bounds filtering', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: {
            name: 'Market',
            stateId: 'state1',
            minLat: '9.0',
            maxLat: '9.1',
            minLng: '7.4',
            maxLng: '7.5',
          },
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            name: ILike('%Market%'),
            stateId: 'state1',
            latitude: Between(9.0, 9.1),
            longitude: Between(7.4, 7.5),
          },
          relations: undefined,
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        });
      });

      it('should ignore incomplete bounds (only min or max provided)', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: {
            name: 'Test',
            minLat: '9.0', // Only min provided, no max
            maxLng: '7.5', // Only max provided, no min
          },
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            name: ILike('%Test%'),
          },
          relations: undefined,
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        });
      });

      it('should handle invalid numeric values in bounds', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: {
            name: 'Test',
            minLat: 'invalid',
            maxLat: 'alsoinvalid',
            minLng: '7.4',
            maxLng: '7.5',
          },
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            name: ILike('%Test%'),
            longitude: Between(7.4, 7.5),
          },
          relations: undefined,
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        });
      });

      it('should work with geographic bounds only (no other filters)', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: {
            minLat: '8.5',
            maxLat: '9.5',
            minLng: '7.0',
            maxLng: '8.0',
          },
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            latitude: Between(8.5, 9.5),
            longitude: Between(7.0, 8.0),
          },
          relations: undefined,
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        });
      });

      it('should handle zero values in bounds', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: {
            minLat: '0',
            maxLat: '1',
            minLng: '0',
            maxLng: '1',
          },
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            latitude: Between(0, 1),
            longitude: Between(0, 1),
          },
          relations: undefined,
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        });
      });

      it('should handle negative coordinates in bounds', async () => {
        const stores = [mockStore];
        mockRepository.find.mockResolvedValue(stores);
        mockRepository.count.mockResolvedValue(1);

        const listOptions = {
          paginationPayload: { page: 1, limit: 10 },
          filterRecordOptions: {
            minLat: '-90',
            maxLat: '-80',
            minLng: '-180',
            maxLng: '-170',
          },
        };

        await modelAction.list(listOptions);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: {
            latitude: Between(-90, -80),
            longitude: Between(-180, -170),
          },
          relations: undefined,
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        });
      });
    });
  });
});
