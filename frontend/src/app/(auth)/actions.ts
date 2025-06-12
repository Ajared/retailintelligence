'use server';

import {
  LoginFormData,
  RegisterFormData,
  registerFormSchema,
  loginFormSchema,
  ForgotPasswordFormData,
  forgotPasswordFormSchema,
  ResetPasswordFormData,
  resetPasswordFormSchema,
} from './schema';
import { z } from 'zod/v4';
import PostHogClient from '~/lib/posthog';
import customFetch from '~/lib/custom-fetch';
import { UserInterface } from '~/types/user';
import { auth, signIn, signOut } from './auth';
import { collectErrorMessages } from '~/lib/utils';
import { ErrorResponse, Response, SuccessResponse } from '~/types/actions';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export const registerUser = async (
  _: Response<UserInterface | null>,
  formData: FormData,
) => {
  const posthog = PostHogClient();
  let rawData: RegisterFormData | null = null;

  try {
    rawData = {
      email: formData.get('email') as string,
      inviteToken: formData.get('inviteToken') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    const validatedData = registerFormSchema.safeParse(rawData);

    if (!validatedData.success) {
      const messages = collectErrorMessages(
        z.treeifyError(validatedData.error),
      );

      return {
        inputs: rawData,
        message: 'Invalid form data',
        timestamp: new Date().toISOString(),
        error: messages,
      } as ErrorResponse & { inputs: RegisterFormData };
    }

    const { email, password, inviteToken } = validatedData.data;

    const response = await customFetch.post<UserInterface>(
      '/auth/register',
      { email, password },
      { headers: { 'invite-token': inviteToken } },
    );

    if (!('data' in response)) {
      posthog.capture({
        distinctId: email,
        properties: response,
        event: 'register_user_error',
      });
      return {
        ...response,
        inputs: rawData,
      } as ErrorResponse & { inputs: RegisterFormData };
    }

    posthog.capture({
      properties: response,
      distinctId: response.data?.id!,
      event: 'register_user_success',
    });
    return response;
  } catch (error) {
    posthog.capture({
      event: 'register_user_error',
      properties: {
        error: error,
        message:
          error instanceof Error ? error.message : 'Something went wrong',
      },
      distinctId: rawData?.email!,
    });
    return {
      inputs: rawData,
      message: 'Something went wrong',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Something went wrong',
    } as ErrorResponse & { inputs: RegisterFormData };
  } finally {
    await posthog.shutdown();
  }
};

export const loginUser = async (email: string, password: string) => {
  const posthog = PostHogClient();
  try {
    const response = await customFetch.post<UserInterface>('/auth/login', {
      email,
      password,
    });

    if (!('data' in response)) {
      posthog.capture({
        event: 'login_user_error',
        properties: response,
        distinctId: email,
      });
      return response as ErrorResponse;
    }

    posthog.capture({
      event: 'login_user_success',
      properties: response,
      distinctId: response.data?.id!,
    });
    return response as SuccessResponse<
      UserInterface & { access_token: string }
    >;
  } finally {
    await posthog.shutdown();
  }
};

export const loginAction = async (
  _: Response<(UserInterface & { access_token: string }) | null>,
  formData: FormData,
) => {
  const session = await auth();
  let rawData: LoginFormData | null = null;

  try {
    rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validatedData = loginFormSchema.safeParse(rawData);

    if (!validatedData.success) {
      const messages = collectErrorMessages(
        z.treeifyError(validatedData.error),
      );

      return {
        inputs: rawData,
        message: 'Invalid form data',
        timestamp: new Date().toISOString(),
        error: messages,
      } as ErrorResponse & { inputs: LoginFormData };
    }

    const { email, password } = validatedData.data;

    await signIn('credentials', {
      email,
      password,
      redirect: true,
      redirectTo: '/',
    });

    if (!session?.user) throw new Error('Something went wrong');

    return {
      data: session?.user,
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    } as SuccessResponse<UserInterface & { access_token: string }>;
  } catch (error) {
    if (isRedirectError(error)) throw error;

    return {
      inputs: rawData,
      message: 'Something went wrong',
      timestamp: new Date().toISOString(),
      error:
        error instanceof Error &&
        error.cause &&
        typeof error.cause === 'object' &&
        'err' in error.cause
          ? (error.cause.err as { message?: string }).message
          : 'Something went wrong',
    } as ErrorResponse & { inputs: LoginFormData };
  }
};

export const forgotPasswordAction = async (
  _: Response<{ email: string } | null>,
  formData: FormData,
) => {
  const posthog = PostHogClient();
  let rawData: ForgotPasswordFormData | null = null;

  try {
    rawData = {
      email: formData.get('email') as string,
    };

    const validatedData = forgotPasswordFormSchema.safeParse(rawData);

    if (!validatedData.success) {
      const messages = collectErrorMessages(
        z.treeifyError(validatedData.error),
      );

      return {
        inputs: rawData,
        message: 'Invalid form data',
        timestamp: new Date().toISOString(),
        error: messages,
      } as ErrorResponse & { inputs: ForgotPasswordFormData };
    }

    const { email } = validatedData.data;

    const response = await customFetch.post<{ email: string }>(
      '/auth/forgot-password',
      { email },
    );

    if (!('data' in response)) {
      posthog.capture({
        event: 'forgot_password_error',
        properties: response,
        distinctId: email,
      });
      return {
        ...response,
        inputs: rawData,
      } as ErrorResponse & { inputs: ForgotPasswordFormData };
    }

    posthog.capture({
      event: 'forgot_password_success',
      properties: response,
      distinctId: email,
    });
    return response;
  } catch (error) {
    posthog.capture({
      event: 'forgot_password_error',
      properties: {
        error: error,
        message:
          error instanceof Error ? error.message : 'Something went wrong',
      },
      distinctId: rawData?.email!,
    });
    return {
      inputs: rawData,
      message: 'Something went wrong',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Something went wrong',
    } as ErrorResponse & { inputs: ForgotPasswordFormData };
  } finally {
    await posthog.shutdown();
  }
};

export const resetPasswordAction = async (
  _: Response<UserInterface | null>,
  formData: FormData,
) => {
  const posthog = PostHogClient();
  let rawData: ResetPasswordFormData | null = null;

  try {
    rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      token: formData.get('token') as string,
    };

    const validatedData = resetPasswordFormSchema.safeParse(rawData);

    if (!validatedData.success) {
      const messages = collectErrorMessages(
        z.treeifyError(validatedData.error),
      );

      return {
        inputs: rawData,
        message: 'Invalid form data',
        timestamp: new Date().toISOString(),
        error: messages,
      } as ErrorResponse & { inputs: ResetPasswordFormData };
    }

    const { email, confirmPassword, token } = validatedData.data;

    const response = await customFetch.post<UserInterface>(
      '/auth/reset-password',
      { email, newPassword: confirmPassword, token },
    );

    if (!('data' in response)) {
      posthog.capture({
        event: 'reset_password_error',
        properties: response,
        distinctId: email,
      });
      return {
        ...response,
        inputs: rawData,
      } as ErrorResponse & { inputs: ResetPasswordFormData };
    }

    posthog.capture({
      event: 'reset_password_success',
      properties: response,
      distinctId: email,
    });
    return response;
  } catch (error) {
    posthog.capture({
      event: 'reset_password_error',
      properties: {
        error: error,
        message:
          error instanceof Error ? error.message : 'Something went wrong',
      },
      distinctId: rawData?.email!,
    });
    return {
      inputs: rawData,
      message: 'Something went wrong',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Something went wrong',
    } as ErrorResponse & { inputs: ResetPasswordFormData };
  } finally {
    await posthog.shutdown();
  }
};
export const logoutAction = async () => {
  const session = await auth();
  const posthog = PostHogClient();
  try {
    posthog.capture({
      event: 'logout_user',
      distinctId: session?.user?.id!,
    });
    await signOut({ redirectTo: '/login' });
  } finally {
    await posthog.shutdown();
  }
};
