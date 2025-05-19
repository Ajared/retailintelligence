import { Request } from 'express';
import * as SYS_MSG from '~/helpers/system-messages';
import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminGuard } from './super-admin.guard';
import { User } from '~/modules/user/entities/user.entity';
import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '~/helpers/custom.exception';
import { UserModelAction } from '~/modules/user/user.model-action';
import { AuthProvider } from '~/modules/auth/constants/auth.constant';

interface MockUserModelAction {
  get: jest.Mock<Promise<User | null>, [{ id: string }]>;
}

const createMockUserModelAction = (): MockUserModelAction => ({
  get: jest.fn(),
});

const createMockExecutionContext = (
  req: Partial<Request>,
): ExecutionContext => {
  const mockHttpArgumentsHost = {
    getRequest: jest.fn().mockReturnValue(req),
    getResponse: jest.fn(),
    getNext: jest.fn(),
  };
  const mockHandler = jest.fn();
  Object.defineProperty(mockHandler, 'name', {
    value: 'mockHandlerName',
    writable: false,
  });
  const mockClass = { name: 'MockControllerName' };

  return {
    switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
    getHandler: jest.fn().mockReturnValue(mockHandler),
    getClass: jest.fn().mockReturnValue(mockClass),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    getType: jest.fn().mockReturnValue('http'),
  } as unknown as ExecutionContext;
};

const mockSuperAdminUser: User = {
  id: 'super-admin-id-123',
  email: 'super@example.com',
  isSuperAdmin: true,
  createdAt: new Date(),
  authProvider: AuthProvider.LOCAL,
  isEmailVerified: true,
  updatedAt: new Date(),
  password: 'hashedpassword',
  stores: [],
};

const mockRegularUser: User = {
  id: 'regular-user-id-456',
  email: 'user@example.com',
  isSuperAdmin: false,
  createdAt: new Date(),
  authProvider: AuthProvider.LOCAL,
  isEmailVerified: true,
  updatedAt: new Date(),
  password: 'hashedpassword',
  stores: [],
};

describe('SuperAdminGuard', () => {
  let guard: SuperAdminGuard;
  let mockRequest: Partial<Request>;
  let mockExecutionContext: ExecutionContext;
  let mockUserModelAction: MockUserModelAction;

  beforeEach(async () => {
    mockRequest = {};
    mockUserModelAction = createMockUserModelAction();
    mockExecutionContext = createMockExecutionContext(mockRequest);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminGuard,
        {
          provide: UserModelAction,
          useValue: mockUserModelAction,
        },
      ],
    }).compile();

    guard = module.get<SuperAdminGuard>(SuperAdminGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if user exists and is a super admin', async () => {
      mockRequest.user = { sub: mockSuperAdminUser.id };
      mockUserModelAction.get.mockResolvedValue(mockSuperAdminUser);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockUserModelAction.get).toHaveBeenCalledWith({
        id: mockSuperAdminUser.id,
      });
      expect(mockExecutionContext.switchToHttp().getRequest).toHaveBeenCalled();
    });

    it('should throw Forbidden CustomHttpException if user exists but is NOT a super admin', async () => {
      mockRequest.user = { sub: mockRegularUser.id };
      mockUserModelAction.get.mockResolvedValue(mockRegularUser);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new CustomHttpException(SYS_MSG.FORBIDDEN_ACTION, HttpStatus.FORBIDDEN),
      );
      expect(mockUserModelAction.get).toHaveBeenCalledWith({
        id: mockRegularUser.id,
      });
    });

    it('should throw Forbidden CustomHttpException if user is not found', async () => {
      const userId = 'non-existent-user-id';
      mockRequest.user = { sub: userId };
      mockUserModelAction.get.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new CustomHttpException(SYS_MSG.FORBIDDEN_ACTION, HttpStatus.FORBIDDEN),
      );
      expect(mockUserModelAction.get).toHaveBeenCalledWith({ id: userId });
    });

    it('should throw Forbidden CustomHttpException if request.user is missing', async () => {
      mockRequest.user = undefined;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        CustomHttpException,
      );
      expect(mockUserModelAction.get).not.toHaveBeenCalled();
    });

    it('should throw Forbidden CustomHttpException if request.user.sub is missing', async () => {
      mockRequest.user = {};

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        CustomHttpException,
      );
      expect(mockUserModelAction.get).not.toHaveBeenCalled();
    });

    it('should catch, wrap, and throw Forbidden CustomHttpException if getUserById throws an unexpected error', async () => {
      const userId = 'some-user-id';
      mockRequest.user = { sub: userId };
      const originalError = new Error('Database connection failed');
      mockUserModelAction.get.mockRejectedValue(originalError);

      const expectedResourceName = `MockControllerName[mockHandlerName]`;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        CustomHttpException,
      );

      try {
        await guard.canActivate(mockExecutionContext);
      } catch (error) {
        const customError = error as CustomHttpException;
        expect(customError.getResponse()).toMatchObject({
          message: SYS_MSG.FORBIDDEN_ACTION,
          error: SYS_MSG.RESOURCE_CURRENTLY_UNAVAILABLE(expectedResourceName),
        });
      }
    });

    it('should re-throw the original CustomHttpException if caught', async () => {
      mockRequest.user = { sub: mockRegularUser.id };
      mockUserModelAction.get.mockResolvedValue(mockRegularUser);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        CustomHttpException,
      );

      try {
        await guard.canActivate(mockExecutionContext);
      } catch (e) {
        const errorResponse = (e as CustomHttpException).getResponse();
        if (typeof errorResponse === 'object' && errorResponse !== null) {
          expect(errorResponse).not.toHaveProperty(
            'error',
            expect.stringContaining('Resource currently unavailable'),
          );
        }
      }
    });
  });
});
