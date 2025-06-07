import { AppService } from './app.service';
import { HttpStatus } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AbstractResponseDto } from './types/response.dto';
import { PaginationOptions } from './helpers/query.helper';
import { CustomHttpException } from './helpers/custom.exception';
import { StateModelAction } from './modules/state/state.model-action';
import { StateInterface } from './modules/state/types/state.interface';

const mockStateModelAction = {
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
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
    const mockPaginationOptions: PaginationOptions = {
      page: '1',
      limit: '10',
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

      const result = await appController.getLocations(mockPaginationOptions);

      expect(result).toEqual(mockStateResponse);
      expect(appService.getLocations).toHaveBeenCalledWith(
        mockPaginationOptions,
      );
    });

    it('should handle empty pagination options', async () => {
      jest
        .spyOn(appService, 'getLocations')
        .mockResolvedValue(mockStateResponse);

      const result = await appController.getLocations({});

      expect(result).toEqual(mockStateResponse);
      expect(appService.getLocations).toHaveBeenCalledWith({});
    });

    it('should handle service errors', async () => {
      const error = new CustomHttpException(
        'Failed to fetch locations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest.spyOn(appService, 'getLocations').mockRejectedValue(error);

      await expect(
        appController.getLocations(mockPaginationOptions),
      ).rejects.toThrow(CustomHttpException);
    });

    it('should validate pagination parameters', async () => {
      const invalidOptions: PaginationOptions = {
        page: 'invalid',
        limit: 'invalid',
      };

      jest
        .spyOn(appService, 'getLocations')
        .mockResolvedValue(mockStateResponse);

      const result = await appController.getLocations(invalidOptions);

      expect(result).toEqual(mockStateResponse);
      expect(appService.getLocations).toHaveBeenCalledWith(invalidOptions);
    });
  });
});
