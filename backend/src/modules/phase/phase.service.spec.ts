import { Test, TestingModule } from '@nestjs/testing';
import { PhaseService } from './phase.service';
import { PhaseModelAction } from './phase.model-action';

const mockPhaseModelAction = {
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('PhaseService', () => {
  let service: PhaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhaseService,
        {
          provide: PhaseModelAction,
          useValue: mockPhaseModelAction,
        },
      ],
    }).compile();

    service = module.get<PhaseService>(PhaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
