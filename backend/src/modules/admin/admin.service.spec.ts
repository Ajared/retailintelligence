import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { StoreModelAction } from '../store/store.model-action';
import { ExportType, PaginationMeta } from '~/helpers/query.helper';
import { Response } from 'express';
import { NullishValueError } from '~/helpers/try-safe';
import { CustomHttpException } from '~/helpers/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { EntityPropertyNotFoundError, EntityMetadata } from 'typeorm';
import { Store } from '../store/entities/store.entity';
import { StoreQueryOptions } from '../store/types/list-store.type';
import { UserRole, UserStatus } from '../user/constants/user.constant';
import { AuthProvider } from '../auth/constants/auth.constant';
import * as SYS_MSG from '~/helpers/system-messages';

describe('AdminService', () => {
  let service: AdminService;
  let storeModelAction: StoreModelAction;

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
    storeType: 'Retail',
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

  const mockPaginationMeta: PaginationMeta = {
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
      list: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: StoreModelAction,
          useValue: mockStoreModelAction,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    storeModelAction = module.get<StoreModelAction>(StoreModelAction);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStoreById', () => {
    it('should return store data when store exists', async () => {
      jest.spyOn(storeModelAction, 'get').mockResolvedValue(mockStore);

      const result = await service.getStoreById('1');

      expect(storeModelAction.get).toHaveBeenCalledWith(
        { id: '1' },
        undefined,
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
      jest
        .spyOn(storeModelAction, 'get')
        .mockRejectedValue(new NullishValueError());

      const call = service.getStoreById('1');
      await expect(call).rejects.toThrow(CustomHttpException);
      await expect(call).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
        message: SYS_MSG.RESOURCE_NOT_FOUND('Store'),
      });
    });

    it('should throw CustomHttpException when store fetch fails', async () => {
      jest
        .spyOn(storeModelAction, 'get')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.getStoreById('1')).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.getStoreById('1')).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: SYS_MSG.RESOURCE_FETCH_FAILED('Store'),
      });
    });
  });

  describe('listStores', () => {
    it('should return list of stores with pagination', async () => {
      const mockStores = {
        payload: [mockStore],
        paginationMeta: mockPaginationMeta,
      };
      jest.spyOn(storeModelAction, 'list').mockResolvedValue(mockStores);

      const result = await service.listStores({ page: '1', limit: '10' });

      expect(storeModelAction.list).toHaveBeenCalledWith({
        paginationPayload: { page: 1, limit: 10 },
        filterRecordOptions: {},
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
      const mockMetadata: Partial<EntityMetadata> = {
        target: Store,
      };
      jest
        .spyOn(storeModelAction, 'list')
        .mockRejectedValue(
          new EntityPropertyNotFoundError(
            'fieldName',
            mockMetadata as EntityMetadata,
          ),
        );

      const invalidQuery = {
        page: '1',
        limit: '10',
        unknownField: 'value',
      } as unknown as StoreQueryOptions;
      await expect(service.listStores(invalidQuery)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.listStores(invalidQuery)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
        message: SYS_MSG.INVALID_PARAMETER('Filter Query'),
      });
    });

    it('should throw CustomHttpException when store list fetch fails', async () => {
      jest
        .spyOn(storeModelAction, 'list')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.listStores({})).rejects.toThrow(CustomHttpException);
      await expect(service.listStores({})).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: SYS_MSG.RESOURCE_FETCH_FAILED('Stores'),
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

      await service.exportStores(mockResponse, { exportType: ExportType.JSON });

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

      await service.exportStores(mockResponse, { exportType: ExportType.CSV });

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

      await service.exportStores(mockResponse, {
        exportType: ExportType.EXCEL,
      });

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

      await service.exportStores(mockResponse, { exportType: ExportType.JSON });

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.send).toHaveBeenCalledWith(
        SYS_MSG.RESOURCE_NOT_FOUND('Stores'),
      );
    });

    it('should handle export errors', async () => {
      jest
        .spyOn(storeModelAction, 'list')
        .mockRejectedValue(new Error(SYS_MSG.RESOURCE_EXPORT_FAILED('Stores')));

      await service.exportStores(mockResponse, { exportType: ExportType.JSON });

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
});
