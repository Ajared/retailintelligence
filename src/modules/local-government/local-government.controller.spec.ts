import { Test, TestingModule } from '@nestjs/testing';
import { LocalGovernmentController } from './local-government.controller';
import { LocalGovernmentService } from './local-government.service';

describe('LocalGovernmentController', () => {
  let controller: LocalGovernmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalGovernmentController],
      providers: [LocalGovernmentService],
    }).compile();

    controller = module.get<LocalGovernmentController>(
      LocalGovernmentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
