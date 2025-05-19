import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { Test, TestingModule } from '@nestjs/testing';

describe('AppController', () => {
  let appService: AppService;
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      jest.spyOn(appService, 'getHello').mockReturnValue('Hello World!');
      expect(appController.getHello()).toBe('Hello World!');
      expect(appService.getHello).toHaveBeenCalled();
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      const mockHealth = { status: 'ok' };
      jest.spyOn(appService, 'getHealth').mockReturnValue(mockHealth);
      expect(appController.getHealth()).toEqual(mockHealth);
      expect(appService.getHealth).toHaveBeenCalled();
    });
  });
});
