import { Test, TestingModule } from '@nestjs/testing';
import { LocalGovernmentService } from './local-government.service';

describe('LocalGovernmentService', () => {
  let service: LocalGovernmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalGovernmentService],
    }).compile();

    service = module.get<LocalGovernmentService>(LocalGovernmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
