import { env } from '~/env';
import { loginUser } from './actions';
import { authConfig } from './auth.config';
import { loginFormSchema } from './schema';
import { UserInterface } from '~/types/user';
import type { DefaultJWT } from 'next-auth/jwt';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: UserInterface & DefaultSession['user'] & { accessToken: string };
  }

  interface User extends UserInterface {
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    user: UserInterface & { accessToken: string };
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginFormSchema.safeParse(credentials);
        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;
        const user = await loginUser(email, password);

        if (!user || 'error' in user) {
          return null;
        }

        return user;
      },
    }),  
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as UserInterface & { accessToken: string };
      }

      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as UserInterface & { accessToken: string; emailVerified: Date | null; id: string };
      }

      return session;
    },
  },
  trustHost: true,
  debug: env.NODE_ENV === 'development',
});
