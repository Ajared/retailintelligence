import { Test, TestingModule } from '@nestjs/testing';
import { LocalGovernmentService } from './local-government.service';
import { LocalGovernmentModelAction } from './local-government.model-action';

describe('LocalGovernmentService', () => {
  const mockLocalGovernmentModelAction = {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  let service: LocalGovernmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalGovernmentService,
        {
          provide: LocalGovernmentModelAction,
          useValue: mockLocalGovernmentModelAction,
        },
      ],
    }).compile();

    service = module.get<LocalGovernmentService>(LocalGovernmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
