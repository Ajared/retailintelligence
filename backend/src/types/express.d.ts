import { JwtPayload } from '~/modules/token/types/token.type';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
    headers: {
      inviteToken?: string;
      authorization?: string;
    };
  }
}
