import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [],
  callbacks: {},
  session: { maxAge: 60 * 60 * 24 * 30 },
};
