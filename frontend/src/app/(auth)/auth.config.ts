import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [],
  callbacks: {},
};
