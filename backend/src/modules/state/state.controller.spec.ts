import { CanActivate } from '@nestjs/common';
import { RoleGuard } from '~/guards/role.guard';
import { StateService } from './state.service';
import { Test, TestingModule } from '@nestjs/testing';
import { StateController } from './state.controller';
import { StateModelAction } from './state.model-action';

describe('StateController', () => {
  const mockStateModelAction = {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockRoleGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };

  let controller: StateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StateController],
      providers: [
        StateService,
        {
          provide: StateModelAction,
          useValue: mockStateModelAction,
        },
      ],
    })
      .overrideGuard(RoleGuard)
      .useValue(mockRoleGuard)
      .compile();

    controller = module.get<StateController>(StateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
