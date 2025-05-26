import { JwtPayload } from '~/modules/token/types/token.type';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
    headers: {
      'invite-token'?: string;
      authorization?: string;
    };
  }
}
