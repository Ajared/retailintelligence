import {
  ForgotPasswordDto,
  ResetPasswordDto,
  RequestEmailVerificationDto,
  VerifyEmailDto,
} from './dto/auth-request.dto';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth-request.dto';
import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  requestEmailVerification: jest.fn(),
  verifyEmail: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with the correct auth DTO and return the result', async () => {
      const authDto: AuthDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = {
        id: 'some-uuid',
        email: 'test@example.com',
      };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(authDto);

      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(mockAuthService.register).toHaveBeenCalledWith(authDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from authService.register', async () => {
      const authDto: AuthDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedError = new Error('Registration failed');
      mockAuthService.register.mockRejectedValue(expectedError);

      await expect(controller.register(authDto)).rejects.toThrow(expectedError);
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(mockAuthService.register).toHaveBeenCalledWith(authDto);
    });
  });

  describe('login', () => {
    it('should call authService.login with the correct auth DTO and return the result', async () => {
      const authDto: AuthDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { access_token: 'some-jwt-token' };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(authDto);

      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(mockAuthService.login).toHaveBeenCalledWith(authDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from authService.login', async () => {
      const authDto: AuthDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedError = new Error('Login failed');
      mockAuthService.login.mockRejectedValue(expectedError);

      await expect(controller.login(authDto)).rejects.toThrow(expectedError);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(mockAuthService.login).toHaveBeenCalledWith(authDto);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword with correct DTO', async () => {
      const dto: ForgotPasswordDto = { email: 'test@example.com' };
      mockAuthService.forgotPassword.mockResolvedValue(true);

      const result = await controller.forgotPassword(dto);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto);
      expect(result).toBe(true);
    });

    it('should handle forgotPassword errors', async () => {
      const dto: ForgotPasswordDto = { email: 'test@example.com' };
      const error = new Error('Password reset failed');
      mockAuthService.forgotPassword.mockRejectedValue(error);

      await expect(controller.forgotPassword(dto)).rejects.toThrow(error);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with correct DTO', async () => {
      const dto: ResetPasswordDto = {
        email: 'test@example.com',
        token: 'reset-token',
        newPassword: 'newPassword123',
      };
      mockAuthService.resetPassword.mockResolvedValue(true);

      const result = await controller.resetPassword(dto);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
      expect(result).toBe(true);
    });
  });

  describe('requestEmailVerification', () => {
    it('should call authService.requestEmailVerification with correct DTO', async () => {
      const dto: RequestEmailVerificationDto = { email: 'test@example.com' };
      mockAuthService.requestEmailVerification.mockResolvedValue(true);

      const result = await controller.requestEmailVerification(dto);

      expect(mockAuthService.requestEmailVerification).toHaveBeenCalledWith(
        dto,
      );
      expect(result).toBe(true);
    });
  });

  describe('verifyEmail', () => {
    it('should call authService.verifyEmail with correct token', async () => {
      const dto: VerifyEmailDto = { token: 'verification-token' };
      mockAuthService.verifyEmail.mockResolvedValue(true);

      const result = await controller.verifyEmail(dto);

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(dto);
      expect(result).toBe(true);
    });
  });
});
