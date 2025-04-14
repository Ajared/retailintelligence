import {
  AuthDto,
  VerifyEmailDto,
  ResetPasswordDto,
  ForgotPasswordDto,
  RequestEmailVerificationDto,
  GoogleAuthDto,
} from './dto/auth-request.dto';
import { compare, hash } from 'bcryptjs';
import { trySafe } from '~/helpers/try-safe';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import * as SYS_MSG from '~/helpers/system-messages';
import { TokenService } from '../token/token.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthProvider } from './constants/auth.constant';
import { GoogleTokenInfo } from './types/auth.interface';
import { AbstractResponseDto } from '~/types/response.dto';
import { UserInterface } from '../user/types/user.interface';
import { CustomHttpException } from '~/helpers/custom.exception';
import CreateUserRecordOptions from '../user/types/create-user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async register(
    authDto: AuthDto,
  ): Promise<AbstractResponseDto<UserInterface>> {
    const { email, password } = authDto;
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
        authProvider: AuthProvider.LOCAL,
        isEmailVerified: false,
      },
      transactionOptions: { useTransaction: false },
    };

    const createdUser = await this.userService.createUser(createUserPayload);

    await Promise.all([
      this.mailService.sendMail({
        to: createdUser.email,
        subject: 'Welcome to Retail Intelligence',
        template: 'welcome',
        context: { name: createdUser.email.split('@')[0] },
      }),
      this.requestEmailVerification({ email: createdUser.email }),
    ]);

    return {
      message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('User'),
      data: createdUser,
    };
  }

  async googleAuth(
    googleAuthDto: GoogleAuthDto,
  ): Promise<
    | AbstractResponseDto<UserInterface>
    | (AbstractResponseDto<UserInterface> & { data: { accessToken: string } })
  > {
    const { email } = await this.verifyGoogleToken(googleAuthDto);
    let user = await this.userService.getUserByEmail(email.toLowerCase());

    if (!user) {
      user = await this.userService.createUser({
        createPayload: {
          email: email.toLowerCase(),
          isEmailVerified: true,
          authProvider: AuthProvider.GOOGLE,
        },
        transactionOptions: { useTransaction: false },
      });

      await this.mailService.sendMail({
        to: user.email.toLowerCase(),
        subject: 'Welcome to Retail Intelligence',
        template: 'welcome',
        context: { name: user.email.toLowerCase().split('@')[0] },
      });

      return {
        message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('User'),
        data: user,
      };
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

    if (!user.isEmailVerified) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_NOT_VERIFIED('Email'),
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

  async requestEmailVerification(
    requestEmailVerificationDto: RequestEmailVerificationDto,
  ): Promise<AbstractResponseDto<{ email: string }>> {
    const { email } = requestEmailVerificationDto;
    const user = await this.validateLocalUser(email);

    if (user.isEmailVerified) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_ALREADY_VERIFIED('Email'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const verificationToken = this.tokenService.generateToken(
      { email: user.email },
      { expiresIn: this.configService.get<string>('EMAIL_JWT_EXPIRES_IN') },
    );

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Verify Your Email Address - Retail Intelligence',
      template: 'verify-email',
      context: {
        name: user.email.split('@')[0],
        link: `${verificationToken}`,
      },
    });

    return {
      message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL(
        'Email Verification Request',
      ),
      data: { email: user.email },
    };
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<AbstractResponseDto<UserInterface>> {
    const { token } = verifyEmailDto;
    const [verifyError, decoded] = await trySafe(() =>
      this.tokenService.verifyToken(token),
    );

    if (verifyError || !decoded.email || decoded.sub) {
      throw new CustomHttpException(
        SYS_MSG.TOKEN_INVALID('Email Verification'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.validateLocalUser(decoded.email);

    if (user.isEmailVerified) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_ALREADY_VERIFIED('Email'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedUser = await this.userService.updateUser({
      updatePayload: { isEmailVerified: true },
      identifierOptions: { id: user.id },
      transactionOptions: { useTransaction: false },
    });

    return {
      message: SYS_MSG.RESOURCE_OPERATION_SUCCESSFUL('Verify Email'),
      data: updatedUser,
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<AbstractResponseDto<{ email: string }>> {
    const { email } = forgotPasswordDto;
    const user = await this.validateLocalUser(email);

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

    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new CustomHttpException(
        SYS_MSG.TOKEN_INVALID('Password Reset'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const [compareError, isTokenValid] = await trySafe(() =>
      compare(token, user.resetPasswordToken!),
    );

    if (compareError) {
      throw new CustomHttpException(
        SYS_MSG.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const isTokenExpired = user.resetPasswordExpires < new Date();

    if (!isTokenValid) {
      throw new CustomHttpException(
        SYS_MSG.TOKEN_INVALID('Password Reset'),
        HttpStatus.BAD_REQUEST,
      );
    }

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

    if (user?.authProvider !== AuthProvider.LOCAL) {
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
