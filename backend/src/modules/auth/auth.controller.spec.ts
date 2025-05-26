import {
  AuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SendInviteEmailDto,
  GoogleAuthDto,
} from './dto/auth-request.dto';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { UserRole } from '../user/constants/user.constant';
import { RoleGuard } from '~/guards/role.guard';
import { AuthGuard } from '~/guards/auth.guard';
import { CanActivate } from '@nestjs/common';
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  sendInviteEmail: jest.fn(),
  googleAuth: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  const mockRoleGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };

  const mockAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RoleGuard)
      .useValue(mockRoleGuard)
      .compile();

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
      const req = { headers: { 'invite-token': 'invite-token' } } as Request;
      const expectedResult = {
        id: 'some-uuid',
        email: 'test@example.com',
      };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(authDto, req);

      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        authDto,
        'invite-token',
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from authService.register', async () => {
      const authDto: AuthDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const req = { headers: { 'invite-token': 'invite-token' } } as Request;
      const expectedError = new Error('Registration failed');
      mockAuthService.register.mockRejectedValue(expectedError);

      await expect(controller.register(authDto, req)).rejects.toThrow(
        expectedError,
      );
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        authDto,
        'invite-token',
      );
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

    it('should handle errors from authService.resetPassword', async () => {
      const dto: ResetPasswordDto = {
        email: 'test@example.com',
        token: 'reset-token',
        newPassword: 'newPassword123',
      };
      const error = new Error('Reset failed');
      mockAuthService.resetPassword.mockRejectedValue(error);
      await expect(controller.resetPassword(dto)).rejects.toThrow(error);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe('invite', () => {
    it('should call authService.sendInviteEmail with correct DTO and return the result', async () => {
      const dto: SendInviteEmailDto = {
        email: 'invite@example.com',
        role: UserRole.ADMIN,
      };
      const expectedResult = { email: 'invite@example.com' };
      mockAuthService.sendInviteEmail.mockResolvedValue(expectedResult);

      const result = await controller.invite(dto);

      expect(mockAuthService.sendInviteEmail).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from authService.sendInviteEmail', async () => {
      const dto: SendInviteEmailDto = {
        email: 'invite@example.com',
        role: UserRole.USER,
      };
      const error = new Error('Invite failed');
      mockAuthService.sendInviteEmail.mockRejectedValue(error);

      await expect(controller.invite(dto)).rejects.toThrow(error);
      expect(mockAuthService.sendInviteEmail).toHaveBeenCalledWith(dto);
    });
  });

  describe('googleAuth', () => {
    it('should call authService.googleAuth with correct DTO and return the result', async () => {
      const dto: GoogleAuthDto = { token: 'google-token' };
      const req = { headers: { 'invite-token': 'invite-token' } } as Request;
      const expectedResult = { data: { accessToken: 'some-jwt-token' } };
      mockAuthService.googleAuth.mockResolvedValue(expectedResult);

      const result = await controller.googleAuth(dto, req);

      expect(mockAuthService.googleAuth).toHaveBeenCalledWith(
        dto,
        'invite-token',
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from authService.googleAuth', async () => {
      const dto: GoogleAuthDto = { token: 'google-token' };
      const req = { headers: { 'invite-token': 'invite-token' } } as Request;
      const error = new Error('Google auth failed');
      mockAuthService.googleAuth.mockRejectedValue(error);

      await expect(controller.googleAuth(dto, req)).rejects.toThrow(error);
      expect(mockAuthService.googleAuth).toHaveBeenCalledWith(
        dto,
        'invite-token',
      );
    });
  });
});
