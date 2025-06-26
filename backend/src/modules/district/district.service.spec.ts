import { DistrictService } from './district.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DistrictModelAction } from './district.model-action';

describe('DistrictService', () => {
  const mockDistrictModelAction = {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  let service: DistrictService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistrictService,
        {
          provide: DistrictModelAction,
          useValue: mockDistrictModelAction,
        },
      ],
    }).compile();

    service = module.get<DistrictService>(DistrictService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
