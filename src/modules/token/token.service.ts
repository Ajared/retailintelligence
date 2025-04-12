import * as crypto from 'crypto';
import { Request } from 'express';
import { trySafe } from '~/helpers/try-safe';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './types/token.type';
import * as SYS_MSG from '~/helpers/system-messages';
import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { CustomHttpException } from '~/helpers/custom.exception';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  extractTokenFromHeader(request: Request): string | undefined {
    const authorizationHeader = request.headers?.authorization;
    if (!authorizationHeader) {
      return undefined;
    }
    const [type, token] = authorizationHeader.split(/\s+/);
    return type?.toLowerCase() === 'bearer' ? token : undefined;
  }

  async verifyToken(token: string): Promise<JwtPayload>;
  async verifyToken(
    token: string,
    request: Request,
  ): Promise<{ request: Request }>;
  async verifyToken(
    token: string,
    request?: Request,
  ): Promise<JwtPayload | { request: Request }> {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new CustomHttpException(
        SYS_MSG.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const [error, payload] = await trySafe(() =>
      this.jwtService.verifyAsync<JwtPayload>(token, { secret }),
    );

    if (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new CustomHttpException(
          SYS_MSG.TOKEN_EXPIRED('Authorization'),
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.TOKEN_INVALID('Authorization'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (request) {
      Object.assign(request, { user: payload });
      return { request };
    }
    return payload;
  }

  generateToken(
    payload: Record<string, unknown>,
    options?: JwtSignOptions,
  ): string {
    const [error, token] = trySafe(() =>
      this.jwtService.sign({ ...payload }, options),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_FAILED('Token Generation'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return token;
  }

  generateOtp(length = 8): string {
    const otpLength = length < 0 ? 8 : length;
    const [error, otp] = trySafe(() =>
      crypto
        .randomBytes(otpLength)
        .toString('hex')
        .toUpperCase()
        .slice(0, otpLength),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_OPERATION_FAILED('OTP Generation'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return otp;
  }
}
