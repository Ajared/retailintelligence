import { CanActivate } from '@nestjs/common';
import { RoleGuard } from '~/guards/role.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { LocalGovernmentService } from './local-government.service';
import { LocalGovernmentController } from './local-government.controller';
import { LocalGovernmentModelAction } from './local-government.model-action';
describe('LocalGovernmentController', () => {
  const mockLocalGovernmentModelAction = {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockRoleGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };

  let controller: LocalGovernmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalGovernmentController],
      providers: [
        LocalGovernmentService,
        {
          provide: LocalGovernmentModelAction,
          useValue: mockLocalGovernmentModelAction,
        },
      ],
    })
      .overrideGuard(RoleGuard)
      .useValue(mockRoleGuard)
      .compile();

    controller = module.get<LocalGovernmentController>(
      LocalGovernmentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
