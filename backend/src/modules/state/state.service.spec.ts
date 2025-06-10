import { Test, TestingModule } from '@nestjs/testing';
import { StateService } from './state.service';
import { StateModelAction } from './state.model-action';

const mockStateModelAction = {
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('StateService', () => {
  let service: StateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StateService,
        {
          provide: StateModelAction,
          useValue: mockStateModelAction,
        },
      ],
    }).compile();

    service = module.get<StateService>(StateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
