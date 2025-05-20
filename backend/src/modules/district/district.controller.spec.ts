import { CanActivate } from '@nestjs/common';
import { RoleGuard } from '~/guards/role.guard';
import { DistrictService } from './district.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DistrictController } from './district.controller';
import { DistrictModelAction } from './district.model-action';

describe('DistrictController', () => {
  const mockDistrictModelAction = {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockRoleGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };

  let controller: DistrictController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistrictController],
      providers: [
        DistrictService,
        {
          provide: DistrictModelAction,
          useValue: mockDistrictModelAction,
        },
      ],
    })
      .overrideGuard(RoleGuard)
      .useValue(mockRoleGuard)
      .compile();

    controller = module.get<DistrictController>(DistrictController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
