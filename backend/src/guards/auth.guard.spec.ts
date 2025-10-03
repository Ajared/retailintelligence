import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import * as SYS_MSG from '~/helpers/system-messages';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '~/modules/user/user.service';
import { TokenService } from '~/modules/token/token.service';
import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '~/helpers/custom.exception';
import { UserStatus } from '~/modules/user/constants/user.constant';

interface MockTokenService {
  extractTokenFromHeader: jest.Mock<string | undefined, [Request]>;
  verifyToken: jest.Mock<Promise<{ request: Request }>, [string, Request]>;
}

interface MockUserService {
  getUserById: jest.Mock<Promise<{ status: UserStatus }>, [string]>;
}

const createMockTokenService = (): MockTokenService => ({
  extractTokenFromHeader: jest.fn(),
  verifyToken: jest.fn(),
});

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

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockTokenService: MockTokenService;
  let mockUserService: MockUserService;
  let mockReflector: Reflector;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    mockTokenService = createMockTokenService();
    mockUserService = createMockUserService();
    mockReflector = new Reflector();
    mockRequest = {};
    mockExecutionContext = createMockExecutionContext(mockRequest);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if route is public', async () => {
      jest.spyOn(mockReflector, 'getAllAndOverride').mockReturnValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockTokenService.extractTokenFromHeader).not.toHaveBeenCalled();
    });

    it('should throw Unauthorized CustomHttpException if no token is found', async () => {
      jest.spyOn(mockReflector, 'getAllAndOverride').mockReturnValue(false);
      mockTokenService.extractTokenFromHeader.mockReturnValue(undefined);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(
        guard.canActivate(mockExecutionContext),
      ).rejects.toMatchObject({
        message: SYS_MSG.TOKEN_INVALID('Authorization'),
        status: HttpStatus.UNAUTHORIZED,
      });
    });

    it('should return true if token is valid and user is active', async () => {
      jest.spyOn(mockReflector, 'getAllAndOverride').mockReturnValue(false);
      const mockToken = 'valid-token';
      const mockUserId = '123e4567-e89b-42d3-a456-426614174000';
      mockTokenService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockTokenService.verifyToken.mockResolvedValue({
        request: { ...mockRequest, user: { sub: mockUserId } } as Request,
      });
      mockUserService.getUserById.mockResolvedValue({
        status: UserStatus.VERIFIED,
      });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockTokenService.verifyToken).toHaveBeenCalledWith(
        mockToken,
        mockRequest,
      );
      expect(mockUserService.getUserById).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw Forbidden CustomHttpException if user is deactivated', async () => {
      jest.spyOn(mockReflector, 'getAllAndOverride').mockReturnValue(false);
      const mockToken = 'valid-token';
      const mockUserId = '123e4567-e89b-42d3-a456-426614174001';
      mockTokenService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockTokenService.verifyToken.mockResolvedValue({
        request: { ...mockRequest, user: { sub: mockUserId } } as Request,
      });
      mockUserService.getUserById.mockResolvedValue({
        id: mockUserId,
        email: 'test@example.com',
        status: UserStatus.VERIFIED,
        deactivatedAt: new Date(),
      } as any);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        CustomHttpException,
      );

      try {
        await guard.canActivate(mockExecutionContext);
      } catch (error) {
        const customError = error as CustomHttpException;
        expect(customError.getResponse()).toMatchObject({
          message: SYS_MSG.RESOURCE_NOT_ACTIVE('User'),
        });
        expect(customError.getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('should allow unverified users for non-mutation endpoints', async () => {
      jest
        .spyOn(mockReflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      const mockToken = 'valid-token';
      const mockUserId = '123e4567-e89b-42d3-a456-426614174002';
      mockTokenService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockTokenService.verifyToken.mockResolvedValue({
        request: { ...mockRequest, user: { sub: mockUserId } } as Request,
      });
      mockUserService.getUserById.mockResolvedValue({
        status: UserStatus.UNVERIFIED,
      });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should block unverified users from mutation endpoints', async () => {
      jest
        .spyOn(mockReflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      const mockToken = 'valid-token';
      const mockUserId = '123e4567-e89b-42d3-a456-426614174003';
      mockTokenService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockTokenService.verifyToken.mockResolvedValue({
        request: { ...mockRequest, user: { sub: mockUserId } } as Request,
      });
      mockUserService.getUserById.mockResolvedValue({
        status: UserStatus.UNVERIFIED,
      });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        CustomHttpException,
      );

      try {
        await guard.canActivate(mockExecutionContext);
      } catch (error) {
        const customError = error as CustomHttpException;
        expect(customError.getResponse()).toMatchObject({
          message: SYS_MSG.RESOURCE_NOT_VERIFIED('User'),
        });
        expect(customError.getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('should throw InternalServerError CustomHttpException if user fetch fails', async () => {
      jest.spyOn(mockReflector, 'getAllAndOverride').mockReturnValue(false);
      const mockToken = 'valid-token';
      const mockUserId = '123e4567-e89b-42d3-a456-426614174004';
      mockTokenService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockTokenService.verifyToken.mockResolvedValue({
        request: { ...mockRequest, user: { sub: mockUserId } } as Request,
      });
      mockUserService.getUserById.mockRejectedValue(
        new Error('User fetch failed'),
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        CustomHttpException,
      );

      try {
        await guard.canActivate(mockExecutionContext);
      } catch (error) {
        const customError = error as CustomHttpException;
        expect(customError.getResponse()).toMatchObject({
          message: SYS_MSG.RESOURCE_FETCH_FAILED('User'),
        });
        expect(customError.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should catch, wrap, and throw Forbidden CustomHttpException if token verification fails', async () => {
      jest.spyOn(mockReflector, 'getAllAndOverride').mockReturnValue(false);
      const mockToken = 'invalid-token';
      mockTokenService.extractTokenFromHeader.mockReturnValue(mockToken);
      const originalError = new Error('Token verification failed');
      mockTokenService.verifyToken.mockRejectedValue(originalError);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        CustomHttpException,
      );

      try {
        await guard.canActivate(mockExecutionContext);
      } catch (error) {
        const customError = error as CustomHttpException;
        expect(customError.getResponse()).toMatchObject({
          message: SYS_MSG.FORBIDDEN_ACTION,
          error: SYS_MSG.RESOURCE_CURRENTLY_UNAVAILABLE(
            'MockControllerName[mockHandlerName]',
          ),
        });
      }
    });

    it('should re-throw the original CustomHttpException if caught', async () => {
      jest.spyOn(mockReflector, 'getAllAndOverride').mockReturnValue(false);
      mockTokenService.extractTokenFromHeader.mockReturnValue('valid-token');
      mockTokenService.verifyToken.mockRejectedValue(
        new CustomHttpException(
          SYS_MSG.TOKEN_INVALID('Authorization'),
          HttpStatus.UNAUTHORIZED,
        ),
      );

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
