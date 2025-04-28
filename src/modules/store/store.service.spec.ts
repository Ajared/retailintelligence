import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from './store.service';
import { StoreModelAction } from './store.model-action';

describe('StoreService', () => {
  let service: StoreService;

  beforeEach(async () => {
    const mockStoreModelAction = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: StoreModelAction,
          useValue: mockStoreModelAction,
        },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
