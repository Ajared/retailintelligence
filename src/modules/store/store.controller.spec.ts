import { Test, TestingModule } from '@nestjs/testing';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { StoreModelAction } from './store.model-action';

describe('StoreController', () => {
  let controller: StoreController;

  beforeEach(async () => {
    const mockStoreModelAction = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
