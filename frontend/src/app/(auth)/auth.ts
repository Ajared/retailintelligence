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
    user: UserInterface & DefaultSession['user'] & { access_token: string };
  }

  interface User extends UserInterface {
    access_token: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    user: UserInterface & { access_token: string };
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
          throw new Error('Invalid Credentials');
        }

        const { email, password } = validatedFields.data;
        const response = await loginUser(email, password);

        if (!response || 'error' in response) {
          throw new Error(response.message || 'Something went wrong');
        }

        return response.data as UserInterface & { access_token: string };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as UserInterface & { access_token: string };
      }

      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as UserInterface & {
          access_token: string;
          emailVerified: Date | null;
          id: string;
        };
      }

      return session;
    },
  },
  trustHost: true,
  session: { maxAge: 60 * 60 * 24 },
  debug: env.NODE_ENV === 'development',
});
