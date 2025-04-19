import { Request } from 'express';
import * as SYS_MSG from '~/helpers/system-messages';
import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminGuard } from './super-admin.guard';
import { UserService } from '~/modules/user/user.service';
import { User } from '~/modules/user/entities/user.entity';
import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '~/helpers/custom.exception';
import { AuthProvider } from '~/modules/auth/constants/auth.constant';

interface MockUserService {
  getUserById: jest.Mock<Promise<User | null>, [string]>;
}

const createMockUserService = (): MockUserService => ({
  getUserById: jest.fn(),
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
  let mockUserService: MockUserService;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    mockUserService = createMockUserService();
    mockRequest = {};
    mockExecutionContext = createMockExecutionContext(mockRequest);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminGuard,
        {
          provide: UserService,
          useValue: mockUserService,
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
      mockUserService.getUserById.mockResolvedValue(mockSuperAdminUser);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(
        mockSuperAdminUser.id,
      );
      expect(mockExecutionContext.switchToHttp().getRequest).toHaveBeenCalled();
    });

    it('should throw Forbidden CustomHttpException if user exists but is NOT a super admin', async () => {
      mockRequest.user = { sub: mockRegularUser.id };
      mockUserService.getUserById.mockResolvedValue(mockRegularUser);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(
        guard.canActivate(mockExecutionContext),
      ).rejects.toMatchObject({
        message: SYS_MSG.FORBIDDEN_ACTION,
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('should throw Forbidden CustomHttpException if user is not found', async () => {
      const userId = 'non-existent-user-id';
      mockRequest.user = { sub: userId };
      mockUserService.getUserById.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        CustomHttpException,
      );
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
    });

    it('should throw Forbidden CustomHttpException if request.user is missing', async () => {
      mockRequest.user = undefined;
      mockUserService.getUserById.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        CustomHttpException,
      );
      expect(mockUserService.getUserById).toHaveBeenCalledWith('');
    });

    it('should throw Forbidden CustomHttpException if request.user.sub is missing', async () => {
      mockRequest.user = {};
      mockUserService.getUserById.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        CustomHttpException,
      );
      expect(mockUserService.getUserById).toHaveBeenCalledWith('');
    });

    it('should catch, wrap, and throw Forbidden CustomHttpException if getUserById throws an unexpected error', async () => {
      const userId = 'some-user-id';
      mockRequest.user = { sub: userId };
      const originalError = new Error('Database connection failed');
      mockUserService.getUserById.mockRejectedValue(originalError);

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
      mockUserService.getUserById.mockResolvedValue(mockRegularUser);

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
