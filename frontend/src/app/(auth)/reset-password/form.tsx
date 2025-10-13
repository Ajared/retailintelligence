'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import Link from 'next/link';
import { Response } from '~/types/actions';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { useActionState, useState, lazy, Suspense } from 'react';
import { resetPasswordAction } from '../actions';
import { ResetPasswordFormData } from '../schema';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
} from '~/components/ui/input-otp';
import { InputOTPSlot } from '~/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { UserInterface } from '~/types/user';

const GlobeCanvas = lazy(() =>
  import('~/components/ui/globe-canvas').then((mod) => ({
    default: mod.GlobeCanvas,
  })),
);

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);

  const initialState: Response<UserInterface> & {
    inputs: ResetPasswordFormData;
  } = {
    inputs: {
      email: '',
      password: '',
      confirmPassword: '',
      token: '',
    },
    error: '',
    message: '',
    timestamp: '',
  };

  const [state, action, isPending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-2xl font-bold text-center mb-8">
        Retail Intelligence
      </h2>
      <Card className="bg-card overflow-hidden rounded-lg border shadow-2xl p-0">
        <div className="grid min-h-[360px] lg:min-h-[480px] lg:grid-cols-2">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
            <div className="mx-auto w-full max-w-sm">
              <div className="space-y-8">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl font-bold text-center">
                    Reset Password
                  </CardTitle>
                  <CardDescription className="text-center">
                    Enter your new password to reset your account.
                  </CardDescription>
                </CardHeader>
                <form
                  action={action}
                  autoComplete="on"
                  className="flex flex-col gap-8"
                >
                  <CardContent className="space-y-4 p-0">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        defaultValue={
                          ('inputs' in state && state.inputs?.email) || ''
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        required
                        id="password"
                        minLength={6}
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        defaultValue={
                          ('inputs' in state && state.inputs?.password) || ''
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          required
                          id="confirmPassword"
                          minLength={6}
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm your new password"
                          defaultValue={
                            ('inputs' in state &&
                              state.inputs?.confirmPassword) ||
                            ''
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 !bg-transparent !hover:bg-transparent cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                          <span className="sr-only">
                            {showPassword ? 'Hide password' : 'Show password'}
                          </span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="token">One-Time Password</Label>
                      <InputOTP
                        required
                        id="token"
                        name="token"
                        maxLength={8}
                        className="w-full"
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                      >
                        <InputOTPGroup className="w-full">
                          <InputOTPSlot className="w-full h-12" index={0} />
                          <InputOTPSlot className="w-full h-12" index={1} />
                          <InputOTPSlot className="w-full h-12" index={2} />
                          <InputOTPSlot className="w-full h-12" index={3} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup className="w-full">
                          <InputOTPSlot className="w-full h-12" index={4} />
                          <InputOTPSlot className="w-full h-12" index={5} />
                          <InputOTPSlot className="w-full h-12" index={6} />
                          <InputOTPSlot className="w-full h-12" index={7} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {state?.message && (
                      <Alert
                        variant={'data' in state ? 'default' : 'destructive'}
                      >
                        {'data' in state && (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        <AlertDescription>
                          {state?.message ||
                            ('error' in state &&
                              state.error &&
                              (Array.isArray(state.error)
                                ? (state.error as string[]).join(', ')
                                : typeof state.error === 'string'
                                  ? state.error
                                  : 'Invalid form data'))}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 p-0">
                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      disabled={isPending}
                    >
                      {isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isPending ? 'Processing' : 'Change Password'}
                    </Button>
                    <div className="text-center text-sm">
                      Remember your password?{' '}
                      <Button
                        asChild
                        type="button"
                        variant="link"
                        className="px-0 cursor-pointer"
                      >
                        <Link href="/login">Login Here</Link>
                      </Button>
                    </div>
                  </CardFooter>
                </form>
              </div>
            </div>
          </div>
          <Suspense
            fallback={
              <div className="relative hidden lg:flex flex-col items-center justify-center h-full border-l" />
            }
          >
            <GlobeCanvas offset={[0, 205]} />
          </Suspense>
        </div>
      </Card>
    </div>
  );
}
