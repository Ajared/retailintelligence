import { AppService } from './app.service';
import { HttpStatus } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AbstractResponseDto } from './types/response.dto';
import { CustomHttpException } from './helpers/custom.exception';
import { StateQueryValidator } from './modules/state/dto/state.dto';
import { PhaseQueryValidator } from './modules/phase/dto/phase.dto';
import { StoreQueryValidator } from './modules/store/dto/store.dto';
import { StateModelAction } from './modules/state/state.model-action';
import { PhaseModelAction } from './modules/phase/phase.model-action';
import { StoreModelAction } from './modules/store/store.model-action';
import { StateInterface } from './modules/state/types/state.interface';
import { PhaseInterface } from './modules/phase/types/phase.interface';
import { StoreInterface } from './modules/store/types/store.interface';

const mockStateModelAction = {
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  list: jest.fn(),
};

const mockPhaseModelAction = {
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  list: jest.fn(),
};

const mockStoreModelAction = {
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  list: jest.fn(),
};

describe('AppController', () => {
  let appService: AppService;
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: StateModelAction,
          useValue: mockStateModelAction,
        },
        {
          provide: PhaseModelAction,
          useValue: mockPhaseModelAction,
        },
        {
          provide: StoreModelAction,
          useValue: mockStoreModelAction,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      jest.spyOn(appService, 'getHello').mockReturnValue('Hello World!');
      expect(appController.getHello()).toBe('Hello World!');
      expect(appService.getHello).toHaveBeenCalled();
    });
  });

  describe('getHealth', () => {
    it('should return health status with correct data structure', () => {
      const mockHealth = {
        message: 'All services are running',
        data: {
          version: '1.0.0',
          uptime: 123,
          environment: 'test',
        },
      };
      jest.spyOn(appService, 'getHealth').mockReturnValue(mockHealth);
      expect(appController.getHealth()).toEqual(mockHealth);
      expect(appService.getHealth).toHaveBeenCalled();
    });

    it('should include all required health check fields', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('version');
      expect(result.data).toHaveProperty('uptime');
      expect(result.data).toHaveProperty('environment');
    });
  });

  describe('getLocations', () => {
    const mockQueryOptions: StateQueryValidator = {
      page: '1',
      limit: '10',
      name: 'Test State',
    };

    const mockStateResponse: AbstractResponseDto<StateInterface[]> = {
      data: [
        {
          id: '1',
          name: 'Test State',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
      message: 'Locations fetched successfully',
    };

    it('should return paginated locations successfully', async () => {
      jest
        .spyOn(appService, 'getLocations')
        .mockResolvedValue(mockStateResponse);

      const result = await appController.getLocations(mockQueryOptions);

      expect(result).toEqual(mockStateResponse);
      expect(appService.getLocations).toHaveBeenCalledWith(mockQueryOptions);
    });

    it('should handle empty query options', async () => {
      const emptyOptions: StateQueryValidator = {};
      jest
        .spyOn(appService, 'getLocations')
        .mockResolvedValue(mockStateResponse);

      const result = await appController.getLocations(emptyOptions);

      expect(result).toEqual(mockStateResponse);
      expect(appService.getLocations).toHaveBeenCalledWith(emptyOptions);
    });

    it('should handle service errors', async () => {
      const error = new CustomHttpException(
        'Failed to fetch locations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest.spyOn(appService, 'getLocations').mockRejectedValue(error);

      await expect(
        appController.getLocations(mockQueryOptions),
      ).rejects.toThrow(CustomHttpException);
    });

    it('should validate query parameters with name filter', async () => {
      const optionsWithName: StateQueryValidator = {
        page: '1',
        limit: '5',
        name: 'Anambra',
      };

      jest
        .spyOn(appService, 'getLocations')
        .mockResolvedValue(mockStateResponse);

      const result = await appController.getLocations(optionsWithName);

      expect(result).toEqual(mockStateResponse);
      expect(appService.getLocations).toHaveBeenCalledWith(optionsWithName);
    });
  });

  describe('getPhases', () => {
    const mockQueryOptions: PhaseQueryValidator = {
      page: '1',
      limit: '10',
      name: 'Test Phase',
    };

    const mockPhaseResponse: AbstractResponseDto<PhaseInterface[]> = {
      data: [
        {
          id: '1',
          name: 'Test Phase',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
      message: 'Phases fetched successfully',
    };

    it('should return paginated phases successfully', async () => {
      jest.spyOn(appService, 'getPhases').mockResolvedValue(mockPhaseResponse);

      const result = await appController.getPhases(mockQueryOptions);

      expect(result).toEqual(mockPhaseResponse);
      expect(appService.getPhases).toHaveBeenCalledWith(mockQueryOptions);
    });

    it('should handle empty query options', async () => {
      const emptyOptions: PhaseQueryValidator = {};
      jest.spyOn(appService, 'getPhases').mockResolvedValue(mockPhaseResponse);

      const result = await appController.getPhases(emptyOptions);

      expect(result).toEqual(mockPhaseResponse);
      expect(appService.getPhases).toHaveBeenCalledWith(emptyOptions);
    });

    it('should handle service errors', async () => {
      const error = new CustomHttpException(
        'Failed to fetch phases',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest.spyOn(appService, 'getPhases').mockRejectedValue(error);

      await expect(appController.getPhases(mockQueryOptions)).rejects.toThrow(
        CustomHttpException,
      );
    });

    it('should validate query parameters with name filter', async () => {
      const optionsWithName: PhaseQueryValidator = {
        page: '1',
        limit: '5',
        name: 'Phase 1',
      };

      jest.spyOn(appService, 'getPhases').mockResolvedValue(mockPhaseResponse);

      const result = await appController.getPhases(optionsWithName);

      expect(result).toEqual(mockPhaseResponse);
      expect(appService.getPhases).toHaveBeenCalledWith(optionsWithName);
    });
  });

  describe('getDashboardData', () => {
    const mockQueryOptions: StoreQueryValidator = {
      page: '1',
      limit: '10',
      name: 'Test Store',
      phaseId: 'phase-1',
      districtId: 'district-1',
    };

    const mockStoreResponse: AbstractResponseDto<StoreInterface[]> = {
      data: [
        {
          id: '1',
          name: 'Test Store',
          address: '123 Test Street',
          storeType: 'Retail',
          latitude: 9.082,
          longitude: 8.6753,
          enumeratorId: 'enumerator-1',
          phaseId: 'phase-1',
          districtId: 'district-1',
          stateId: 'state-1',
          localGovernmentId: 'lg-1',
          landmarks: 'Near Test Landmark',
          photos: ['photo1.jpg', 'photo2.jpg'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
      message: 'Stores fetched successfully',
    };

    it('should return paginated dashboard data successfully', async () => {
      jest
        .spyOn(appService, 'getDashboardData')
        .mockResolvedValue(mockStoreResponse);

      const result = await appController.getDashboardData(mockQueryOptions);

      expect(result).toEqual(mockStoreResponse);
      expect(appService.getDashboardData).toHaveBeenCalledWith(
        mockQueryOptions,
      );
    });

    it('should handle empty query options', async () => {
      const emptyOptions: StoreQueryValidator = {};
      jest
        .spyOn(appService, 'getDashboardData')
        .mockResolvedValue(mockStoreResponse);

      const result = await appController.getDashboardData(emptyOptions);

      expect(result).toEqual(mockStoreResponse);
      expect(appService.getDashboardData).toHaveBeenCalledWith(emptyOptions);
    });

    it('should handle service errors', async () => {
      const error = new CustomHttpException(
        'Failed to fetch dashboard data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest.spyOn(appService, 'getDashboardData').mockRejectedValue(error);

      await expect(
        appController.getDashboardData(mockQueryOptions),
      ).rejects.toThrow(CustomHttpException);
    });

    it('should validate query parameters with name filter', async () => {
      const optionsWithName: StoreQueryValidator = {
        page: '1',
        limit: '5',
        name: 'Supermarket',
      };

      jest
        .spyOn(appService, 'getDashboardData')
        .mockResolvedValue(mockStoreResponse);

      const result = await appController.getDashboardData(optionsWithName);

      expect(result).toEqual(mockStoreResponse);
      expect(appService.getDashboardData).toHaveBeenCalledWith(optionsWithName);
    });

    it('should validate query parameters with phase filter', async () => {
      const optionsWithPhase: StoreQueryValidator = {
        page: '1',
        limit: '10',
        phaseId: 'phase-2',
      };

      jest
        .spyOn(appService, 'getDashboardData')
        .mockResolvedValue(mockStoreResponse);

      const result = await appController.getDashboardData(optionsWithPhase);

      expect(result).toEqual(mockStoreResponse);
      expect(appService.getDashboardData).toHaveBeenCalledWith(
        optionsWithPhase,
      );
    });

    it('should validate query parameters with district filter', async () => {
      const optionsWithDistrict: StoreQueryValidator = {
        page: '1',
        limit: '10',
        districtId: 'district-3',
      };

      jest
        .spyOn(appService, 'getDashboardData')
        .mockResolvedValue(mockStoreResponse);

      const result = await appController.getDashboardData(optionsWithDistrict);

      expect(result).toEqual(mockStoreResponse);
      expect(appService.getDashboardData).toHaveBeenCalledWith(
        optionsWithDistrict,
      );
    });

    it('should validate query parameters with enumerator filter', async () => {
      const optionsWithEnumerator: StoreQueryValidator = {
        page: '1',
        limit: '10',
        enumeratorId: 'enumerator-2',
      };

      jest
        .spyOn(appService, 'getDashboardData')
        .mockResolvedValue(mockStoreResponse);

      const result = await appController.getDashboardData(
        optionsWithEnumerator,
      );

      expect(result).toEqual(mockStoreResponse);
      expect(appService.getDashboardData).toHaveBeenCalledWith(
        optionsWithEnumerator,
      );
    });

    it('should validate query parameters with local government filter', async () => {
      const optionsWithLocalGov: StoreQueryValidator = {
        page: '1',
        limit: '10',
        localGovernmentId: 'lg-2',
      };

      jest
        .spyOn(appService, 'getDashboardData')
        .mockResolvedValue(mockStoreResponse);

      const result = await appController.getDashboardData(optionsWithLocalGov);

      expect(result).toEqual(mockStoreResponse);
      expect(appService.getDashboardData).toHaveBeenCalledWith(
        optionsWithLocalGov,
      );
    });

    it('should handle multiple filter parameters', async () => {
      const multipleFilters: StoreQueryValidator = {
        page: '2',
        limit: '15',
        name: 'Mall',
        phaseId: 'phase-1',
        districtId: 'district-2',
        enumeratorId: 'enumerator-3',
      };

      jest
        .spyOn(appService, 'getDashboardData')
        .mockResolvedValue(mockStoreResponse);

      const result = await appController.getDashboardData(multipleFilters);

      expect(result).toEqual(mockStoreResponse);
      expect(appService.getDashboardData).toHaveBeenCalledWith(multipleFilters);
    });

    it('should handle pagination parameters correctly', async () => {
      const paginationOptions: StoreQueryValidator = {
        page: '3',
        limit: '20',
      };

      jest
        .spyOn(appService, 'getDashboardData')
        .mockResolvedValue(mockStoreResponse);

      const result = await appController.getDashboardData(paginationOptions);

      expect(result).toEqual(mockStoreResponse);
      expect(appService.getDashboardData).toHaveBeenCalledWith(
        paginationOptions,
      );
    });
  });
});
