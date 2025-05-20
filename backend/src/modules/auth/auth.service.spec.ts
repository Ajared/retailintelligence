import * as bcrypt from 'bcryptjs';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import * as SYS_MSG from '~/helpers/system-messages';
import { TokenService } from '../token/token.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider } from './constants/auth.constant';
import { UserInterface } from '../user/types/user.interface';
import { CustomHttpException } from '~/helpers/custom.exception';
import CreateUserRecordOptions from '../user/types/create-user.type';
import { UserRole, UserStatus } from '../user/constants/user.constant';

const mockUserService = {
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
};

const mockTokenService = {
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  generateOtp: jest.fn(),
};

const mockMailService = {
  sendMail: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'INVITE_JWT_EXPIRES_IN') return '1d';
    if (key === 'EMAIL_OTP_EXPIRES_IN') return 300000;
    if (key === 'FRONTEND_URL') return 'http://localhost:3000';
    if (key === 'AUTH_CLIENT_ID') return 'test-google-client-id';
    return undefined;
  }),
};

const testEmail = 'test@example.com';
const testPassword = 'password123';
const testHashedPassword = 'hashedPassword123';
const testUserId = 'user-id-123';
const testAccessToken = 'mockAccessToken';
const testInviteToken = 'mockInviteToken';
const testResetOtp = '123456';
const testHashedResetOtp = 'hashedResetOtp';
const testNewPassword = 'newPassword456';
const testHashedNewPassword = 'hashedNewPassword456';
const testGoogleToken = 'valid-google-id-token';
const testGoogleClientId = 'test-google-client-id';

const dateNow = new Date();
const date2DaysAgo = new Date(dateNow.getTime() - 2 * 24 * 60 * 60 * 1000);

const mockUser: UserInterface = {
  id: testUserId,
  email: testEmail,
  password: testHashedPassword,
  authProvider: AuthProvider.LOCAL,
  createdAt: date2DaysAgo,
  updatedAt: date2DaysAgo,
  resetPasswordToken: undefined,
  resetPasswordExpires: undefined,
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
};

const mockUserOldUpdate: UserInterface = {
  ...mockUser,
  updatedAt: date2DaysAgo,
};

const mockUserWithResetToken: UserInterface = {
  ...mockUser,
  updatedAt: dateNow,
  resetPasswordToken: testHashedResetOtp,
  resetPasswordExpires: new Date(dateNow.getTime() + 300000),
};

const mockUserWithExpiredResetToken: UserInterface = {
  ...mockUser,
  updatedAt: dateNow,
  resetPasswordToken: testHashedResetOtp,
  resetPasswordExpires: new Date(dateNow.getTime() - 10000),
};

const mockUserNonLocal: UserInterface = {
  ...mockUser,
  authProvider: AuthProvider.GOOGLE,
};

const mockGoogleUser: UserInterface = {
  id: 'google-user-id-456',
  email: testEmail,
  password: '',
  authProvider: AuthProvider.GOOGLE,
  createdAt: dateNow,
  updatedAt: dateNow,
  resetPasswordToken: undefined,
  resetPasswordExpires: undefined,
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
};

const mockFetchResponse = (
  ok: boolean,
  status: number,
  jsonData: unknown | null = null,
  jsonError: boolean = false,
) => {
  return Promise.resolve({
    ok,
    status,
    json: jsonError
      ? jest.fn().mockRejectedValue(new Error('JSON parse error'))
      : jest.fn().mockResolvedValue(jsonData),
  });
};

const mockGooglePayload = {
  email: testEmail,
  email_verified: true,
  aud: testGoogleClientId,
  azp: testGoogleClientId,
};

type BcryptComparePromise = (
  data: string | Buffer,
  encrypted: string,
) => Promise<boolean>;
type BcryptHashPromise = (
  data: string | Buffer,
  saltOrRounds: string | number,
) => Promise<string>;

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<typeof mockUserService>;
  let tokenService: jest.Mocked<typeof mockTokenService>;
  let mailService: jest.Mocked<typeof mockMailService>;
  let configService: jest.Mocked<typeof mockConfigService>;
  let hashSpy: jest.MockedFunction<BcryptHashPromise>;
  let compareSpy: jest.MockedFunction<BcryptComparePromise>;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();

    hashSpy = jest.spyOn(
      bcrypt,
      'hash',
    ) as unknown as jest.MockedFunction<BcryptHashPromise>;
    compareSpy = jest.spyOn(
      bcrypt,
      'compare',
    ) as unknown as jest.MockedFunction<BcryptComparePromise>;

    fetchSpy = jest.spyOn(global, 'fetch');

    hashSpy.mockResolvedValue(testHashedPassword);
    compareSpy.mockResolvedValue(true);
    fetchSpy.mockImplementation(() =>
      mockFetchResponse(true, 200, mockGooglePayload),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: MailService, useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService) as jest.Mocked<
      typeof mockUserService
    >;
    tokenService = module.get(TokenService) as jest.Mocked<
      typeof mockTokenService
    >;
    mailService = module.get(MailService) as jest.Mocked<
      typeof mockMailService
    >;
    configService = module.get(ConfigService) as jest.Mocked<
      typeof mockConfigService
    >;

    tokenService.generateOtp.mockReturnValue(testResetOtp);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = { email: testEmail, password: testPassword };
    const createUserPayload: CreateUserRecordOptions = {
      createPayload: {
        email: testEmail.toLowerCase(),
        password: testHashedPassword,
        authProvider: AuthProvider.LOCAL,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      },
      transactionOptions: { useTransaction: false },
    };

    it('should successfully register a new user and send welcome email', async () => {
      userService.getUserByEmail.mockResolvedValueOnce(null);
      userService.createUser.mockResolvedValue(mockUser);
      tokenService.generateToken.mockReturnValue(testInviteToken);
      tokenService.verifyToken.mockResolvedValue({
        email: testEmail,
        role: UserRole.USER,
      });

      const result = await service.register(registerDto, testInviteToken);

      await new Promise(process.nextTick);

      expect(userService.getUserByEmail).toHaveBeenCalledTimes(1);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        testEmail.toLowerCase(),
      );
      expect(hashSpy).toHaveBeenCalledWith(testPassword, 10);
      expect(userService.createUser).toHaveBeenCalledWith(createUserPayload);

      expect(mailService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockUser.email,
          subject: 'Welcome to Retail Intelligence',
          template: 'welcome',
          context: {
            name: mockUser.email.toLowerCase().split('@')[0],
            unsubscribeLink: 'placeholder',
          },
        }),
      );

      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('User'),
        data: mockUser,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUser);
      tokenService.verifyToken.mockResolvedValue({
        email: testEmail,
        role: UserRole.USER,
      });

      await expect(
        service.register(registerDto, testInviteToken),
      ).rejects.toThrow(CustomHttpException);
      await expect(
        service.register(registerDto, testInviteToken),
      ).rejects.toMatchObject({
        message: SYS_MSG.RESOURCE_ALREADY_EXISTS('User'),
        status: HttpStatus.CONFLICT,
      });
      expect(userService.createUser).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if password hashing fails', async () => {
      userService.getUserByEmail.mockResolvedValue(null);
      tokenService.verifyToken.mockResolvedValue({
        email: testEmail,
        role: UserRole.USER,
      });
      hashSpy.mockRejectedValue(new Error('Hashing failed'));

      await expect(
        service.register(registerDto, testInviteToken),
      ).rejects.toThrow(CustomHttpException);
      await expect(
        service.register(registerDto, testInviteToken),
      ).rejects.toMatchObject({
        message: SYS_MSG.INTERNAL_SERVER_ERROR,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if user creation fails in DB', async () => {
      userService.getUserByEmail.mockResolvedValue(null);
      tokenService.verifyToken.mockResolvedValue({
        email: testEmail,
        role: UserRole.USER,
      });
      hashSpy.mockResolvedValue(testHashedPassword);
      userService.createUser.mockRejectedValue(new Error('Database error'));

      await expect(
        service.register(registerDto, testInviteToken),
      ).rejects.toThrow('Database error');

      expect(mailService.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('googleAuth', () => {
    const googleAuthDto = { token: testGoogleToken };
    it('should successfully create a new user via Google Auth', async () => {
      userService.getUserByEmail.mockResolvedValue(null);
      userService.createUser.mockResolvedValue(mockGoogleUser);
      mailService.sendMail.mockResolvedValue(Promise.resolve());
      tokenService.verifyToken.mockResolvedValue({
        email: testEmail,
        role: UserRole.USER,
      });

      const result = await service.googleAuth(googleAuthDto, testInviteToken);

      expect(fetchSpy).toHaveBeenCalledWith(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${testGoogleToken}`,
      );
      expect(configService.get).toHaveBeenCalledWith('AUTH_CLIENT_ID');
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        testEmail.toLowerCase(),
      );
      expect(userService.createUser).toHaveBeenCalledWith({
        createPayload: {
          email: testEmail.toLowerCase(),
          status: UserStatus.ACTIVE,
          role: UserRole.USER,
          authProvider: AuthProvider.GOOGLE,
        },
        transactionOptions: { useTransaction: false },
      });
      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: mockGoogleUser.email.toLowerCase(),
        subject: 'Welcome to Retail Intelligence',
        template: 'welcome',
        context: {
          name: mockGoogleUser.email.toLowerCase().split('@')[0],
          unsubscribeLink: 'placeholder',
        },
      });
      expect(tokenService.generateToken).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('User'),
        data: mockGoogleUser,
      });
    });

    it('should successfully log in an existing user via Google Auth', async () => {
      userService.getUserByEmail.mockResolvedValue(mockGoogleUser);
      tokenService.generateToken.mockReturnValue(testAccessToken);
      tokenService.verifyToken.mockResolvedValue({
        email: testEmail,
        role: UserRole.USER,
      });

      const result = await service.googleAuth(googleAuthDto);

      expect(fetchSpy).toHaveBeenCalledWith(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${testGoogleToken}`,
      );
      expect(configService.get).toHaveBeenCalledWith('AUTH_CLIENT_ID');

      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        testEmail.toLowerCase(),
      );
      expect(userService.createUser).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
      expect(tokenService.generateToken).toHaveBeenCalledWith({
        sub: mockGoogleUser.id,
        email: mockGoogleUser.email.toLowerCase(),
      });
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('Google Auth'),
        data: { ...mockGoogleUser, accessToken: testAccessToken },
      });
    });

    it('should throw UnauthorizedException if Google token is invalid (400 response)', async () => {
      fetchSpy.mockImplementation(() => mockFetchResponse(false, 400));

      await expect(service.googleAuth(googleAuthDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.googleAuth(googleAuthDto)).rejects.toMatchObject({
        message: SYS_MSG.TOKEN_INVALID('Google Auth'),
        status: HttpStatus.UNAUTHORIZED,
      });
      expect(userService.getUserByEmail).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on fetch network error', async () => {
      fetchSpy.mockRejectedValue(new Error('Network failed'));

      await expect(service.googleAuth(googleAuthDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.googleAuth(googleAuthDto)).rejects.toMatchObject({
        message: SYS_MSG.RESOURCE_OPERATION_FAILED('Google Auth'),
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
      expect(userService.getUserByEmail).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on failed JSON parsing', async () => {
      fetchSpy.mockImplementation(() =>
        mockFetchResponse(true, 200, null, true),
      );

      await expect(service.googleAuth(googleAuthDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.googleAuth(googleAuthDto)).rejects.toMatchObject({
        message: SYS_MSG.RESOURCE_OPERATION_FAILED('Google Auth'),
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
      expect(userService.getUserByEmail).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if Google email is not verified', async () => {
      const payloadNotVerified = {
        ...mockGooglePayload,
        email_verified: false,
      };
      fetchSpy.mockImplementation(() =>
        mockFetchResponse(true, 200, payloadNotVerified),
      );

      await expect(service.googleAuth(googleAuthDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.googleAuth(googleAuthDto)).rejects.toMatchObject({
        message: SYS_MSG.RESOURCE_NOT_VERIFIED('Email'),
        status: HttpStatus.UNAUTHORIZED,
      });
      expect(userService.getUserByEmail).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if Google token audience (aud) mismatch', async () => {
      const payloadWrongAud = { ...mockGooglePayload, aud: 'wrong-client-id' };
      fetchSpy.mockImplementation(() =>
        mockFetchResponse(true, 200, payloadWrongAud),
      );

      await expect(service.googleAuth(googleAuthDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.googleAuth(googleAuthDto)).rejects.toMatchObject({
        message: SYS_MSG.RESOURCE_NOT_VERIFIED('Email'),
        status: HttpStatus.UNAUTHORIZED,
      });
      expect(userService.getUserByEmail).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if Google token presenter (azp) mismatch', async () => {
      const payloadWrongAzp = { ...mockGooglePayload, azp: 'wrong-client-id' };
      fetchSpy.mockImplementation(() =>
        mockFetchResponse(true, 200, payloadWrongAzp),
      );

      await expect(service.googleAuth(googleAuthDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.googleAuth(googleAuthDto)).rejects.toMatchObject({
        message: SYS_MSG.RESOURCE_NOT_VERIFIED('Email'),
        status: HttpStatus.UNAUTHORIZED,
      });
      expect(userService.getUserByEmail).not.toHaveBeenCalled();
    });

    it('should propagate error if user creation fails during Google Auth', async () => {
      userService.getUserByEmail.mockResolvedValue(null);
      const dbError = new Error('DB connection lost');
      userService.createUser.mockRejectedValue(dbError);
      tokenService.verifyToken.mockResolvedValue({
        email: testEmail,
        role: UserRole.USER,
      });

      await expect(
        service.googleAuth(googleAuthDto, testInviteToken),
      ).rejects.toThrow(dbError);

      expect(fetchSpy).toHaveBeenCalled();
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        testEmail.toLowerCase(),
      );
      expect(userService.createUser).toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = { email: testEmail, password: testPassword };

    it('should successfully log in a user', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUser);
      compareSpy.mockResolvedValue(true);
      tokenService.generateToken.mockReturnValue(testAccessToken);

      const result = await service.login(loginDto);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        testEmail.toLowerCase(),
      );
      expect(compareSpy).toHaveBeenCalledWith(testPassword, mockUser.password);
      expect(tokenService.generateToken).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email.toLowerCase(),
      });
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('Login'),
        data: {
          ...mockUser,
          accessToken: testAccessToken,
        },
      });
    });

    it('should throw ForbiddenException if local user not found', async () => {
      userService.getUserByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.login(loginDto)).rejects.toMatchObject({
        message: SYS_MSG.FORBIDDEN_ACTION,
        status: HttpStatus.FORBIDDEN,
      });
      expect(compareSpy).not.toHaveBeenCalled();
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user uses non-LOCAL auth provider', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUserNonLocal);

      await expect(service.login(loginDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.login(loginDto)).rejects.toMatchObject({
        message: SYS_MSG.FORBIDDEN_ACTION,
        status: HttpStatus.FORBIDDEN,
      });
      expect(compareSpy).not.toHaveBeenCalled();
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUser);
      compareSpy.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.login(loginDto)).rejects.toMatchObject({
        message: SYS_MSG.INVALID_CREDENTIALS(['Email', 'Password']),
        status: HttpStatus.UNAUTHORIZED,
      });
      expect(compareSpy).toHaveBeenCalledWith(testPassword, mockUser.password);
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password comparison fails', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUser);
      compareSpy.mockRejectedValue(new Error('bcrypt error'));

      await expect(service.login(loginDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.login(loginDto)).rejects.toMatchObject({
        message: SYS_MSG.INVALID_CREDENTIALS(['Email', 'Password']),
        status: HttpStatus.UNAUTHORIZED,
      });
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    const forgotDto = { email: testEmail };

    it('should successfully generate OTP, hash it, store hash, and send email', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUserOldUpdate);
      tokenService.generateOtp.mockReturnValue(testResetOtp);
      hashSpy.mockResolvedValue(testHashedResetOtp);

      const result = await service.forgotPassword(forgotDto);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        testEmail.toLowerCase(),
      );
      expect(tokenService.generateOtp).toHaveBeenCalled();
      expect(hashSpy).toHaveBeenCalledWith(testResetOtp, 10);
      expect(configService.get).toHaveBeenCalledWith('EMAIL_OTP_EXPIRES_IN');
      expect(userService.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          updatePayload: {
            resetPasswordToken: testHashedResetOtp,
            resetPasswordExpires: expect.any(Date),
          },
          identifierOptions: { id: mockUserOldUpdate.id },
        }),
      );
      type UpdateUserCallArg = {
        updatePayload: {
          resetPasswordToken: string;
          resetPasswordExpires: Date;
        };
        identifierOptions: { id: string };
        transactionOptions?: { useTransaction: boolean };
      };
      const firstCallArgs = userService.updateUser.mock.calls[0] as [
        UpdateUserCallArg,
      ];
      const updateCallArgs = firstCallArgs[0];
      const expectedExpiry = Date.now() + 300000;
      expect(
        updateCallArgs.updatePayload.resetPasswordExpires.getTime(),
      ).toBeCloseTo(expectedExpiry, -3);

      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: mockUserOldUpdate.email,
        subject: 'Reset Your Password - Retail Intelligence',
        template: 'otp-email',
        context: {
          code: testResetOtp,
          name: mockUserOldUpdate.email.split('@')[0],
          validityPeriod: '5',
        },
      });
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('Forgot Password'),
        data: { email: mockUserOldUpdate.email },
      });
    });

    it('should throw TooManyRequestsException if called too frequently (user updated recently)', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUserWithResetToken);

      await expect(service.forgotPassword(forgotDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.forgotPassword(forgotDto)).rejects.toMatchObject({
        message: SYS_MSG.RESOURCE_OPERATION_TOO_FREQUENT('Password Reset'),
        status: HttpStatus.TOO_MANY_REQUESTS,
      });
      expect(tokenService.generateOtp).not.toHaveBeenCalled();
      expect(hashSpy).not.toHaveBeenCalled();
      expect(userService.updateUser).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user not found', async () => {
      userService.getUserByEmail.mockResolvedValue(null);

      await expect(service.forgotPassword(forgotDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.forgotPassword(forgotDto)).rejects.toMatchObject({
        message: SYS_MSG.FORBIDDEN_ACTION,
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('should throw ForbiddenException if user is not local', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUserNonLocal);

      await expect(service.forgotPassword(forgotDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.forgotPassword(forgotDto)).rejects.toMatchObject({
        message: SYS_MSG.FORBIDDEN_ACTION,
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('should throw InternalServerErrorException if OTP hashing fails', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUserOldUpdate);
      tokenService.generateOtp.mockReturnValue(testResetOtp);
      hashSpy.mockRejectedValue(new Error('Hashing failed'));

      await expect(service.forgotPassword(forgotDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.forgotPassword(forgotDto)).rejects.toMatchObject({
        message: SYS_MSG.INTERNAL_SERVER_ERROR,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
      expect(userService.updateUser).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const resetDto = {
      email: testEmail,
      token: testResetOtp,
      newPassword: testNewPassword,
    };

    beforeEach(() => {
      hashSpy.mockResolvedValue(testHashedNewPassword);
      compareSpy.mockResolvedValue(true);
    });

    it('should successfully reset password with valid, non-expired token', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUserWithResetToken);

      const result = await service.resetPassword(resetDto);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        testEmail.toLowerCase(),
      );
      expect(compareSpy).toHaveBeenCalledWith(
        testResetOtp,
        mockUserWithResetToken.resetPasswordToken,
      );
      expect(hashSpy).toHaveBeenCalledWith(testNewPassword, 10);
      expect(userService.updateUser).toHaveBeenCalledWith({
        updatePayload: {
          password: testHashedNewPassword,
          resetPasswordToken: '',
          resetPasswordExpires: new Date(0),
        },
        identifierOptions: { id: mockUserWithResetToken.id },
        transactionOptions: { useTransaction: false },
      });
      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: mockUserWithResetToken.email,
        subject: 'Password Reset Successful - Retail Intelligence',
        template: 'reset-success',
        context: {
          name: mockUserWithResetToken.email.split('@')[0],
          loginLink: 'placeholder',
        },
      });
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('Password Reset'),
        data: mockUserWithResetToken,
      });
    });

    it('should throw BadRequestException if token does not match stored hash', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUserWithResetToken);
      compareSpy.mockResolvedValue(false);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.resetPassword(resetDto)).rejects.toMatchObject({
        message: SYS_MSG.TOKEN_INVALID('Password Reset'),
        status: HttpStatus.BAD_REQUEST,
      });
      expect(hashSpy).not.toHaveBeenCalled();
      expect(userService.updateUser).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if token is expired', async () => {
      userService.getUserByEmail.mockResolvedValue(
        mockUserWithExpiredResetToken,
      );
      compareSpy.mockResolvedValue(true);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.resetPassword(resetDto)).rejects.toMatchObject({
        message: SYS_MSG.TOKEN_EXPIRED('Password Reset'),
        status: HttpStatus.BAD_REQUEST,
      });
      expect(hashSpy).not.toHaveBeenCalled();
      expect(userService.updateUser).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user has no reset token set', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUser);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.resetPassword(resetDto)).rejects.toMatchObject({
        message: SYS_MSG.TOKEN_INVALID('Password Reset'),
        status: HttpStatus.BAD_REQUEST,
      });
      expect(compareSpy).not.toHaveBeenCalled();
      expect(hashSpy).not.toHaveBeenCalled();
      expect(userService.updateUser).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenExcepINTERNAL_SERVER_ERRORtion if user not found', async () => {
      userService.getUserByEmail.mockResolvedValue(null);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.resetPassword(resetDto)).rejects.toMatchObject({
        message: SYS_MSG.FORBIDDEN_ACTION,
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('should throw ForbiddenException if user is not local', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUserNonLocal);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.resetPassword(resetDto)).rejects.toMatchObject({
        message: SYS_MSG.FORBIDDEN_ACTION,
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('should throw BadRequestException if comparing token fails', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUserWithResetToken);
      compareSpy.mockRejectedValue(new Error('Compare error'));

      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.resetPassword(resetDto)).rejects.toMatchObject({
        message: SYS_MSG.TOKEN_INVALID('Password Reset'),
        status: HttpStatus.BAD_REQUEST,
      });
      expect(hashSpy).not.toHaveBeenCalled();
      expect(userService.updateUser).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if hashing new password fails', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUserWithResetToken);
      compareSpy.mockResolvedValue(true);
      hashSpy.mockRejectedValue(new Error('Hash error'));

      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.resetPassword(resetDto)).rejects.toMatchObject({
        message: SYS_MSG.INTERNAL_SERVER_ERROR,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
      expect(userService.updateUser).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('sendInviteEmail', () => {
    const inviteDto = { email: testEmail, role: UserRole.USER };
    const superAdminInviteDto = {
      email: testEmail,
      role: UserRole.SUPER_ADMIN,
    };

    it('should throw ForbiddenException if role is SUPER_ADMIN', async () => {
      await expect(
        service.sendInviteEmail(superAdminInviteDto),
      ).rejects.toThrow(CustomHttpException);
      await expect(
        service.sendInviteEmail(superAdminInviteDto),
      ).rejects.toMatchObject({
        message: SYS_MSG.FORBIDDEN_ACTION,
        status: HttpStatus.FORBIDDEN,
      });
      expect(userService.getUserByEmail).not.toHaveBeenCalled();
      expect(tokenService.generateToken).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should successfully send an invite email to a new user', async () => {
      userService.getUserByEmail.mockResolvedValue(null);
      tokenService.generateToken.mockReturnValue(testInviteToken);
      mailService.sendMail.mockResolvedValue(undefined);

      const result = await service.sendInviteEmail(inviteDto);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        testEmail.toLowerCase(),
      );
      expect(configService.get).toHaveBeenCalledWith('INVITE_JWT_EXPIRES_IN');
      expect(tokenService.generateToken).toHaveBeenCalledWith(
        { email: testEmail.toLowerCase(), role: UserRole.USER },
        { expiresIn: '1d' },
      );
      expect(configService.get).toHaveBeenCalledWith('FRONTEND_URL');
      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: testEmail,
        subject: 'Invitation to join Retail Intelligence',
        template: 'invite',
        context: {
          role: UserRole.USER,
          name: testEmail.split('@')[0],
          link: 'http://localhost:3000/register?inviteToken=' + testInviteToken,
        },
      });
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('Invite Email Sent'),
        data: { email: testEmail },
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      userService.getUserByEmail.mockResolvedValue(mockUser);
      await expect(service.sendInviteEmail(inviteDto)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.sendInviteEmail(inviteDto)).rejects.toMatchObject({
        message: SYS_MSG.RESOURCE_ALREADY_EXISTS('User'),
        status: HttpStatus.CONFLICT,
      });
      expect(tokenService.generateToken).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should propagate error if mailService.sendMail fails', async () => {
      userService.getUserByEmail.mockResolvedValue(null);
      tokenService.generateToken.mockReturnValue(testInviteToken);
      mailService.sendMail.mockRejectedValue(new Error('Mail error'));
      configService.get.mockReturnValue('1d');
      await expect(service.sendInviteEmail(inviteDto)).rejects.toThrow(
        'Mail error',
      );
    });

    it('should propagate error if tokenService.generateToken fails', async () => {
      userService.getUserByEmail.mockResolvedValue(null);
      tokenService.generateToken.mockImplementation(() => {
        throw new Error('Token error');
      });
      configService.get.mockReturnValue('1d');
      await expect(service.sendInviteEmail(inviteDto)).rejects.toThrow(
        'Token error',
      );
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should propagate error if configService.get fails', async () => {
      userService.getUserByEmail.mockResolvedValue(null);
      tokenService.generateToken.mockReturnValue(testInviteToken);
      configService.get.mockImplementation(() => {
        throw new Error('Config error');
      });
      await expect(service.sendInviteEmail(inviteDto)).rejects.toThrow(
        'Config error',
      );
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });
  });
});
