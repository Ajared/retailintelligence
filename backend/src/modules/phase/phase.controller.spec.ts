import { CanActivate } from '@nestjs/common';
import { RoleGuard } from '~/guards/role.guard';
import { PhaseService } from './phase.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PhaseController } from './phase.controller';
import { PhaseModelAction } from './phase.model-action';

describe('PhaseController', () => {
  const mockPhaseModelAction = {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockRoleGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };

  let controller: PhaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhaseController],
      providers: [
        PhaseService,
        {
          provide: PhaseModelAction,
          useValue: mockPhaseModelAction,
        },
      ],
    })
      .overrideGuard(RoleGuard)
      .useValue(mockRoleGuard)
      .compile();

    controller = module.get<PhaseController>(PhaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
