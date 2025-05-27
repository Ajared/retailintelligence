import {
  AuthDto,
  GoogleAuthDto,
  ResetPasswordDto,
  ForgotPasswordDto,
  SendInviteEmailDto,
} from './dto/auth-request.dto';
import { compare, hash } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import * as SYS_MSG from '~/helpers/system-messages';
import { TokenService } from '../token/token.service';
import { AuthProvider } from './constants/auth.constant';
import { GoogleTokenInfo } from './types/auth.interface';
import { AbstractResponseDto } from '~/types/response.dto';
import { UserInterface } from '../user/types/user.interface';
import { NullishValueError, trySafe } from '~/helpers/try-safe';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CustomHttpException } from '~/helpers/custom.exception';
import CreateUserRecordOptions from '../user/types/create-user.type';
import { UserRole, UserStatus } from '../user/constants/user.constant';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger('AuthService');

  async register(
    authDto: AuthDto,
    inviteToken?: string,
  ): Promise<AbstractResponseDto<UserInterface>> {
    if (!inviteToken) {
      throw new CustomHttpException(
        SYS_MSG.MISSING_REQUIRED_PARAMETER('Invite Token'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const [error, decoded] = await trySafe(() =>
      this.tokenService.verifyToken(inviteToken),
    );

    if (error || !decoded.email || !decoded.role) {
      throw new CustomHttpException(
        SYS_MSG.TOKEN_INVALID('Invite'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const { email, password } = authDto;
    const { email: decodedEmail, role: decodedRole } = decoded;

    if (
      typeof decodedEmail !== 'string' ||
      decodedEmail.toLowerCase() !== email.toLowerCase()
    ) {
      throw new CustomHttpException(
        SYS_MSG.INVALID_CREDENTIALS(['Email']),
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUser = await this.userService.getUserByEmail(
      email.toLowerCase(),
    );

    if (existingUser) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_ALREADY_EXISTS('User'),
        HttpStatus.CONFLICT,
      );
    }

    const [hashError, hashedPassword] = await trySafe(() => hash(password, 10));

    if (hashError) {
      throw new CustomHttpException(
        SYS_MSG.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const createUserPayload: CreateUserRecordOptions = {
      createPayload: {
        email: email.toLowerCase(),
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        role: decodedRole as UserRole,
        authProvider: AuthProvider.LOCAL,
      },
      transactionOptions: { useTransaction: false },
    };

    const createdUser = await this.userService.createUser(createUserPayload);

    void Promise.all([
      this.mailService.sendMail({
        to: createdUser.email,
        subject: 'Welcome to Retail Intelligence',
        template: 'welcome',
        context: {
          name: createdUser.email.split('@')[0],
          unsubscribeLink: 'placeholder',
        },
      }),
    ]).catch(() => {
      this.logger.error(
        `Failed to send welcome email for user ${createdUser.email}`,
      );
    });

    return {
      data: createdUser,
      message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('User'),
    };
  }

  async googleAuth(
    googleAuthDto: GoogleAuthDto,
    inviteToken?: string,
  ): Promise<
    | AbstractResponseDto<UserInterface>
    | (AbstractResponseDto<UserInterface> & { data: { accessToken: string } })
  > {
    const { email } = await this.verifyGoogleToken(googleAuthDto);
    const user = await this.userService.getUserByEmail(email.toLowerCase());

    if (!user) {
      if (!inviteToken) {
        throw new CustomHttpException(
          SYS_MSG.MISSING_REQUIRED_PARAMETER('Invite Token'),
          HttpStatus.BAD_REQUEST,
        );
      }

      const [error, decoded] = await trySafe(() =>
        this.tokenService.verifyToken(inviteToken),
      );

      if (error || !decoded.email || !decoded.role) {
        throw new CustomHttpException(
          SYS_MSG.TOKEN_INVALID('Invite'),
          HttpStatus.BAD_REQUEST,
        );
      }

      const { email: decodedEmail, role: decodedRole } = decoded;

      if (
        typeof decodedEmail !== 'string' ||
        decodedEmail.toLowerCase() !== email.toLowerCase()
      ) {
        throw new CustomHttpException(
          SYS_MSG.INVALID_CREDENTIALS(['Email']),
          HttpStatus.BAD_REQUEST,
        );
      }

      const createdUser = await this.userService.createUser({
        createPayload: {
          email: email.toLowerCase(),
          status: UserStatus.ACTIVE,
          role: decodedRole as UserRole,
          authProvider: AuthProvider.GOOGLE,
        },
        transactionOptions: { useTransaction: false },
      });

      void this.mailService
        .sendMail({
          to: createdUser.email.toLowerCase(),
          subject: 'Welcome to Retail Intelligence',
          template: 'welcome',
          context: {
            name: createdUser.email.toLowerCase().split('@')[0],
            unsubscribeLink: 'placeholder',
          },
        })
        .catch(() => {
          this.logger.error(
            `Failed to send welcome email to ${createdUser.email}`,
          );
        });

      return {
        message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('User'),
        data: createdUser,
      };
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_NOT_ACTIVE('User'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const accessToken = this.tokenService.generateToken({
      sub: user.id,
      email: user.email.toLowerCase(),
    });

    return {
      message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('Google Auth'),
      data: { ...user, accessToken },
    };
  }

  async login(
    authDto: AuthDto,
  ): Promise<
    AbstractResponseDto<UserInterface> & { data: { accessToken: string } }
  > {
    const { email, password } = authDto;
    const user = await this.validateLocalUser(email);

    if (user.status !== UserStatus.ACTIVE) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_NOT_ACTIVE('User'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const [compareError, isMatch] = await trySafe(() =>
      compare(password, user.password),
    );

    if (compareError || !isMatch)
      throw new CustomHttpException(
        SYS_MSG.INVALID_CREDENTIALS(['Email', 'Password']),
        HttpStatus.UNAUTHORIZED,
      );

    const accessToken = this.tokenService.generateToken({
      sub: user.id,
      email: user.email.toLowerCase(),
    });

    return {
      message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('Login'),
      data: { ...user, accessToken },
    };
  }

  async sendInviteEmail(
    sendInviteEmailDto: SendInviteEmailDto,
  ): Promise<AbstractResponseDto<{ email: string }>> {
    const { email, role } = sendInviteEmailDto;

    if (role === UserRole.SUPER_ADMIN) {
      throw new CustomHttpException(
        SYS_MSG.FORBIDDEN_ACTION,
        HttpStatus.FORBIDDEN,
      );
    }

    const existingUser = await this.userService.getUserByEmail(
      email.toLowerCase(),
    );

    if (existingUser) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_ALREADY_EXISTS('User'),
        HttpStatus.CONFLICT,
      );
    }

    const inviteToken = this.tokenService.generateToken(
      { email: email.toLowerCase(), role },
      { expiresIn: this.configService.get<string>('INVITE_JWT_EXPIRES_IN') },
    );

    await this.mailService.sendMail({
      to: email,
      subject: 'Invitation to join Retail Intelligence',
      template: 'invite',
      context: {
        role,
        name: email.split('@')[0],
        isAdmin: role === UserRole.ADMIN,
        link: `${this.configService.get<string>('FRONTEND_URL')}/register?inviteToken=${inviteToken}`,
      },
    });

    return {
      message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('Invite User'),
      data: { email },
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<AbstractResponseDto<{ email: string }>> {
    const { email } = forgotPasswordDto;
    const user = await this.userService.getUserByEmail(email.toLowerCase());

    if (!user) {
      throw new CustomHttpException(
        SYS_MSG.INVALID_CREDENTIALS(['Email']),
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (
      user?.authProvider !== AuthProvider.LOCAL ||
      user.status !== UserStatus.ACTIVE
    ) {
      throw new CustomHttpException(
        SYS_MSG.FORBIDDEN_ACTION,
        HttpStatus.FORBIDDEN,
      );
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (user.updatedAt && user.updatedAt > oneDayAgo) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_TOO_FREQUENT('Password Reset'),
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const resetTokenExpires = new Date(
      Date.now() + this.configService.get<number>('EMAIL_OTP_EXPIRES_IN')!,
    );
    const resetToken = this.tokenService.generateOtp();

    const [hashError, hashedToken] = await trySafe(() => hash(resetToken, 10));

    if (hashError) {
      throw new CustomHttpException(
        SYS_MSG.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.userService.updateUser({
      updatePayload: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: resetTokenExpires,
      },
      identifierOptions: { id: user.id },
      transactionOptions: { useTransaction: false },
    });

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Reset Your Password - Retail Intelligence',
      template: 'otp-email',
      context: {
        code: resetToken,
        name: user.email.split('@')[0],
        validityPeriod: Math.floor(
          this.configService.get<number>('EMAIL_OTP_EXPIRES_IN')! / 60000,
        ).toString(),
      },
    });

    return {
      message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('Forgot Password'),
      data: { email: user.email },
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<AbstractResponseDto<UserInterface>> {
    const { email, token, newPassword } = resetPasswordDto;
    const user = await this.validateLocalUser(email);

    const [passwordCompareError, passwordMatch] = await trySafe(() =>
      compare(newPassword, user.password),
    );

    if (passwordCompareError || passwordMatch) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_CONFLICT('Password', 'Reset Password'),
        HttpStatus.CONFLICT,
      );
    }

    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new CustomHttpException(
        SYS_MSG.TOKEN_INVALID('Password Reset'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const [compareError, isMatch] = await trySafe(() =>
      compare(token, user.resetPasswordToken!),
    );

    if (compareError || !isMatch) {
      if (compareError instanceof NullishValueError || !isMatch) {
        throw new CustomHttpException(
          SYS_MSG.TOKEN_INVALID('Password Reset'),
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const isTokenExpired = user.resetPasswordExpires < new Date();

    if (isTokenExpired) {
      throw new CustomHttpException(
        SYS_MSG.TOKEN_EXPIRED('Password Reset'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const [hashError, hashedPassword] = await trySafe(() =>
      hash(newPassword, 10),
    );

    if (hashError) {
      throw new CustomHttpException(
        SYS_MSG.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.userService.updateUser({
      updatePayload: {
        password: hashedPassword,
        resetPasswordToken: '',
        resetPasswordExpires: new Date(0),
      },
      identifierOptions: { id: user.id },
      transactionOptions: { useTransaction: false },
    });

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Password Reset Successful - Retail Intelligence',
      template: 'reset-success',
      context: {
        name: user.email.split('@')[0],
        loginLink: 'placeholder',
      },
    });

    return {
      message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('Password Reset'),
      data: user,
    };
  }

  private async validateLocalUser(email: string) {
    const user = await this.userService.getUserByEmail(email.toLowerCase());

    if (!user) {
      throw new CustomHttpException(
        SYS_MSG.INVALID_CREDENTIALS(['Email', 'Password']),
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (
      user?.authProvider !== AuthProvider.LOCAL ||
      user.status !== UserStatus.ACTIVE
    ) {
      throw new CustomHttpException(
        SYS_MSG.FORBIDDEN_ACTION,
        HttpStatus.FORBIDDEN,
      );
    }

    return user;
  }

  private async verifyGoogleToken({ token }: GoogleAuthDto) {
    const [fetchError, response] = await trySafe(() =>
      fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`),
    );

    if (fetchError || !response.ok) {
      throw new CustomHttpException(
        response?.status === 400
          ? SYS_MSG.TOKEN_INVALID('Google Auth')
          : SYS_MSG.RESOURCE_OPERATION_FAILED('Google Auth'),
        fetchError ? HttpStatus.INTERNAL_SERVER_ERROR : HttpStatus.UNAUTHORIZED,
      );
    }

    const [jsonError, payload] = await trySafe<GoogleTokenInfo>(() =>
      response.json(),
    );

    if (jsonError || !payload.email_verified) {
      throw new CustomHttpException(
        jsonError
          ? SYS_MSG.RESOURCE_OPERATION_FAILED('Google Auth')
          : SYS_MSG.RESOURCE_NOT_VERIFIED('Email'),
        jsonError ? HttpStatus.INTERNAL_SERVER_ERROR : HttpStatus.UNAUTHORIZED,
      );
    }

    const AUTH_CLIENT_ID = this.configService.get<string>('AUTH_CLIENT_ID');
    if (!(payload.aud === AUTH_CLIENT_ID && payload.azp === AUTH_CLIENT_ID)) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_NOT_VERIFIED('Email'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    return { email: payload.email };
  }
}
