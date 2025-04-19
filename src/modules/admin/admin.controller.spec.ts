import { CanActivate } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminGuard } from '~/guards/super-admin.guard';

const mockSuperAdminGuard: CanActivate = {
  canActivate: jest.fn(() => true),
};

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
    })
      .overrideGuard(SuperAdminGuard)
      .useValue(mockSuperAdminGuard)
      .compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
