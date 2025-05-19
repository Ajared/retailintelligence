import { Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { JwtPayload } from './types/token.type';
import * as SYS_MSG from '~/helpers/system-messages';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { CustomHttpException } from '~/helpers/custom.exception';

type MockRequest = {
  headers: { authorization?: string };
  user?: JwtPayload;
};

describe('TokenService', () => {
  let service: TokenService;
  let mockJwtService: Partial<JwtService>;
  let mockConfigService: Partial<ConfigService>;

  const mockSecret = 'test-jwt-secret';
  const mockToken = 'mock-jwt-token';
  const mockPayload: JwtPayload = { sub: 'user123', username: 'testuser' };

  beforeEach(async () => {
    mockJwtService = {
      verifyAsync: jest.fn(),
      sign: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);

    (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') {
        return mockSecret;
      }
      return undefined;
    });
    (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
    (mockJwtService.sign as jest.Mock).mockReturnValue(mockToken);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractTokenFromHeader', () => {
    it('should return the token if Authorization header is valid Bearer type', () => {
      const mockRequest: MockRequest = {
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      };
      const token = service.extractTokenFromHeader(mockRequest as Request);
      expect(token).toBe(mockToken);
    });

    it('should return undefined if Authorization header is missing', () => {
      const mockRequest: MockRequest = {
        headers: {},
      };
      const token = service.extractTokenFromHeader(mockRequest as Request);
      expect(token).toBeUndefined();
    });

    it('should return undefined if Authorization header is empty', () => {
      const mockRequest: MockRequest = {
        headers: { authorization: '' },
      };
      const token = service.extractTokenFromHeader(mockRequest as Request);
      expect(token).toBeUndefined();
    });

    it('should return undefined if Authorization header type is not Bearer', () => {
      const mockRequest: MockRequest = {
        headers: {
          authorization: `Basic ${mockToken}`,
        },
      };
      const token = service.extractTokenFromHeader(mockRequest as Request);
      expect(token).toBeUndefined();
    });

    it('should return undefined if Authorization header is malformed (no space)', () => {
      const mockRequest: MockRequest = {
        headers: {
          authorization: `Bearer${mockToken}`,
        },
      };
      const token = service.extractTokenFromHeader(mockRequest as Request);
      expect(token).toBeUndefined();
    });

    it('should return undefined if Authorization header is malformed (only type)', () => {
      const mockRequest: MockRequest = {
        headers: {
          authorization: 'Bearer',
        },
      };
      const token = service.extractTokenFromHeader(mockRequest as Request);
      expect(token).toBeUndefined();
    });

    it('should handle lowercase "bearer" type', () => {
      const mockRequest: MockRequest = {
        headers: { authorization: 'bearer mocktoken' },
      };
      expect(service.extractTokenFromHeader(mockRequest as Request)).toBe(
        'mocktoken',
      );
    });

    it('should handle multiple spaces in authorization header', () => {
      const mockRequest: MockRequest = {
        headers: { authorization: 'Bearer   mocktoken' },
      };
      const result = service.extractTokenFromHeader(mockRequest as Request);
      expect(result).toBe('mocktoken');
    });

    it('should handle special characters in token', () => {
      const specialToken = 'tok!@#$%^&*()en';
      const mockRequest: MockRequest = {
        headers: { authorization: `Bearer ${specialToken}` },
      };
      expect(service.extractTokenFromHeader(mockRequest as Request)).toBe(
        specialToken,
      );
    });
  });

  describe('verifyToken', () => {
    let mockRequest: MockRequest;

    beforeEach(() => {
      mockRequest = { headers: {} };
    });

    it('should verify a valid token, attach payload to request, and return request', async () => {
      const result = await service.verifyToken(
        mockToken,
        mockRequest as Request,
      );

      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(mockToken, {
        secret: mockSecret,
      });
      expect(result.request).toBe(mockRequest);
      expect(result.request['user']).toEqual(mockPayload);
    });

    it('should throw CustomHttpException (INTERNAL_SERVER_ERROR) if JWT secret is not configured', async () => {
      (mockConfigService.get as jest.Mock).mockReturnValueOnce(undefined);

      await expect(
        service.verifyToken(mockToken, mockRequest as Request),
      ).rejects.toThrow(CustomHttpException);

      try {
        await service.verifyToken(mockToken, mockRequest as Request);
      } catch (error: unknown) {
        if (error instanceof CustomHttpException) {
          expect(error.message).toBe(SYS_MSG.INTERNAL_SERVER_ERROR);
          expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          fail('Expected error to be an instance of CustomHttpException');
        }
        expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
      }
    });

    it('should throw CustomHttpException (UNAUTHORIZED - EXPIRED) if token is expired', async () => {
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      (mockJwtService.verifyAsync as jest.Mock).mockRejectedValueOnce(
        expiredError,
      );

      await expect(
        service.verifyToken(mockToken, mockRequest as Request),
      ).rejects.toThrow(CustomHttpException);

      try {
        await service.verifyToken(mockToken, mockRequest as Request);
      } catch (error: unknown) {
        if (error instanceof CustomHttpException) {
          expect(error.message).toBe(SYS_MSG.TOKEN_EXPIRED('Authorization'));
          expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        } else {
          fail('Expected error to be an instance of CustomHttpException');
        }
      }
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(mockToken, {
        secret: mockSecret,
      });
    });

    it('should throw CustomHttpException (UNAUTHORIZED - INVALID) for other JWT errors', async () => {
      const genericError = new Error('Invalid signature');
      (mockJwtService.verifyAsync as jest.Mock).mockRejectedValueOnce(
        genericError,
      );

      await expect(
        service.verifyToken(mockToken, mockRequest as Request),
      ).rejects.toThrow(CustomHttpException);

      try {
        await service.verifyToken(mockToken, mockRequest as Request);
      } catch (error: unknown) {
        if (error instanceof CustomHttpException) {
          expect(error.message).toBe(SYS_MSG.TOKEN_INVALID('Authorization'));
          expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        } else {
          fail('Expected error to be an instance of CustomHttpException');
        }
      }
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(mockToken, {
        secret: mockSecret,
      });
    });

    it('should throw CustomHttpException (UNAUTHORIZED - INVALID) if verifyAsync throws non-Error', async () => {
      (mockJwtService.verifyAsync as jest.Mock).mockRejectedValueOnce(
        'some string error',
      );

      await expect(
        service.verifyToken(mockToken, mockRequest as Request),
      ).rejects.toThrow(CustomHttpException);

      try {
        await service.verifyToken(mockToken, mockRequest as Request);
      } catch (error: unknown) {
        if (error instanceof CustomHttpException) {
          expect(error.message).toBe(SYS_MSG.TOKEN_INVALID('Authorization'));
          expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        } else {
          fail('Expected error to be an instance of CustomHttpException');
        }
      }
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(mockToken, {
        secret: mockSecret,
      });
    });

    it('should return payload directly when no request is provided', async () => {
      const result = await service.verifyToken(mockToken);
      expect(result).toEqual(mockPayload);
    });

    it('should handle empty token string', async () => {
      (mockJwtService.verifyAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Invalid token'),
      );

      await expect(service.verifyToken('')).rejects.toThrow(
        CustomHttpException,
      );
    });

    it('should attach payload to existing user property', async () => {
      const mockRequest: MockRequest = {
        headers: { authorization: `Bearer ${mockToken}` },
        user: {},
      };
      await service.verifyToken(mockToken, mockRequest as Request);
      expect(mockRequest.user).toEqual(mockPayload);
    });
  });

  describe('generateToken', () => {
    it('should call jwtService.sign with the payload and return the generated token', () => {
      const inputPayload = { userId: 1, email: 'test@example.com' };
      const expectedSignedToken = 'signed-jwt-token-from-mock';
      (mockJwtService.sign as jest.Mock).mockReturnValueOnce(
        expectedSignedToken,
      );

      const token = service.generateToken(inputPayload);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { ...inputPayload },
        undefined,
      );
      expect(token).toBe(expectedSignedToken);
    });

    it('should call jwtService.sign with payload and options', () => {
      const payload = { userId: 1 };
      const options: JwtSignOptions = { expiresIn: '1h' };

      service.generateToken(payload, options);

      expect(mockJwtService.sign).toHaveBeenCalledWith(payload, options);
    });

    it('should handle an empty payload', () => {
      const inputPayload = {};
      const expectedSignedToken = 'signed-empty-payload-token';
      (mockJwtService.sign as jest.Mock).mockReturnValueOnce(
        expectedSignedToken,
      );

      const token = service.generateToken(inputPayload);

      expect(mockJwtService.sign).toHaveBeenCalledWith({}, undefined);
      expect(token).toBe(expectedSignedToken);
    });
  });

  describe('generateOtp', () => {
    it('should generate 8-character uppercase hex string by default', () => {
      const otp = service.generateOtp();
      expect(otp).toMatch(/^[0-9A-F]{8}$/);
    });

    it('should generate OTP with custom length', () => {
      const lengths = [6, 12, 4];
      lengths.forEach((length) => {
        const otp = service.generateOtp(length);
        expect(otp).toMatch(new RegExp(`^[0-9A-F]{${length}}$`));
      });
    });

    it('should default to 8 characters for negative lengths', () => {
      const otp = service.generateOtp(-5);
      expect(otp).toMatch(/^[0-9A-F]{8}$/);
    });
  });
});
