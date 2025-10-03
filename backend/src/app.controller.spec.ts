import { AppService } from './app.service';
import { HttpStatus } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AbstractResponseDto } from './types/response.dto';
import { CustomHttpException } from './helpers/custom.exception';
import { StateQueryValidator } from './modules/state/dto/state.dto';
import { PhaseQueryValidator } from './modules/phase/dto/phase.dto';
import { StateModelAction } from './modules/state/state.model-action';
import { PhaseModelAction } from './modules/phase/phase.model-action';
import { StoreModelAction } from './modules/store/store.model-action';
import { StateInterface } from './modules/state/types/state.interface';
import { PhaseInterface } from './modules/phase/types/phase.interface';

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
});
