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
import { forgotPasswordAction, resetPasswordAction } from '../actions';
import { ForgotPasswordFormData, ResetPasswordFormData } from '../schema';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  useActionState,
  useState,
  useEffect,
  useEffectEvent,
  lazy,
  Suspense,
  useRef,
  startTransition,
} from 'react';
import { Alert, AlertDescription } from '~/components/ui/alert';
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

type Step = 1 | 2 | 'success';

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [countdown]);

  const forgotPasswordInitialState: Response<{ email: string }> & {
    inputs: ForgotPasswordFormData;
  } = {
    inputs: {
      email: '',
    },
    error: '',
    message: '',
    timestamp: '',
  };

  const [
    forgotPasswordState,
    forgotPasswordActionWithState,
    isForgotPasswordPending,
  ] = useActionState(forgotPasswordAction, forgotPasswordInitialState);

  const resetPasswordInitialState: Response<UserInterface> & {
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

  const [
    resetPasswordState,
    resetPasswordActionWithState,
    isResetPasswordPending,
  ] = useActionState(resetPasswordAction, resetPasswordInitialState);

  const onForgotPasswordSuccess = useEffectEvent(() => {
    if (
      step === 1 &&
      'data' in forgotPasswordState &&
      forgotPasswordState.data?.email
    ) {
      startTransition(() => {
        setEmail(forgotPasswordState.data.email);
        setStep(2);
        setCountdown(300);
      });
    }
  });

  useEffect(() => {
    onForgotPasswordSuccess();
  }, [forgotPasswordState]);

  const onResetPasswordSuccess = useEffectEvent(() => {
    if (step === 2 && 'data' in resetPasswordState && resetPasswordState.data) {
      startTransition(() => {
        setStep('success');
      });
    }
  });

  useEffect(() => {
    onResetPasswordSuccess();
  }, [resetPasswordState]);

  const handleResendCode = () => {
    if (resendCount >= 3 || countdown > 0) return;

    const formData = new FormData();
    formData.append('email', email);
    startTransition(() => {
      forgotPasswordActionWithState(formData);
    });
    setResendCount((prev) => prev + 1);
    setCountdown(300);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'success') {
    return (
      <div className="w-full max-w-4xl">
        <Link
          href="/"
          className="flex items-center justify-center text-2xl font-bold text-center mb-8"
        >
          Retailytics
        </Link>
        <Card className="bg-card overflow-hidden rounded-lg border shadow-2xl p-0">
          <div className="grid min-h-[360px] lg:min-h-[480px] lg:grid-cols-2">
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
              <div className="mx-auto w-full max-w-sm">
                <div className="space-y-8">
                  <CardHeader className="p-0">
                    <CardTitle className="text-2xl font-bold text-center">
                      Password Reset Successful
                    </CardTitle>
                    <CardDescription className="text-center">
                      Your password has been successfully reset. You can now log
                      in with your new password.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Alert variant="default">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Password reset successful
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 p-0">
                    <Button asChild className="w-full cursor-pointer">
                      <Link href="/login">Back to Login</Link>
                    </Button>
                  </CardFooter>
                </div>
              </div>
            </div>
            <Suspense
              fallback={
                <div className="relative hidden lg:flex flex-col items-center justify-center h-full border-l" />
              }
            >
              <GlobeCanvas />
            </Suspense>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <Link
        href="/"
        className="flex items-center justify-center text-2xl font-bold text-center mb-8"
      >
        Retailytics
      </Link>
      <Card className="bg-card overflow-hidden rounded-lg border shadow-2xl p-0">
        <div className="grid min-h-[360px] lg:min-h-[480px] lg:grid-cols-2">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
            <div className="mx-auto w-full max-w-sm">
              <div className="space-y-8">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl font-bold text-center">
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {step === 1
                      ? 'Enter your email to reset your password.'
                      : `Enter a new password for ${email}.`}
                  </CardDescription>
                </CardHeader>

                {step === 1 && (
                  <form
                    action={forgotPasswordActionWithState}
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
                            ('inputs' in forgotPasswordState &&
                              forgotPasswordState.inputs?.email) ||
                            ''
                          }
                          required
                        />
                      </div>

                      {forgotPasswordState?.message && (
                        <Alert
                          variant={
                            'data' in forgotPasswordState
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {'data' in forgotPasswordState && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          <AlertDescription>
                            {forgotPasswordState?.message ||
                              ('error' in forgotPasswordState &&
                                forgotPasswordState.error &&
                                (Array.isArray(forgotPasswordState.error)
                                  ? forgotPasswordState.error.join(', ')
                                  : typeof forgotPasswordState.error ===
                                      'string'
                                    ? forgotPasswordState.error
                                    : 'Invalid form data'))}
                          </AlertDescription>
                        </Alert>
                      )}

                      {'data' in forgotPasswordState &&
                        forgotPasswordState.data?.email && (
                          <Alert variant="default">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                              OTP successfully sent to{' '}
                              <span className="font-bold">
                                {forgotPasswordState.data.email}
                              </span>
                            </AlertDescription>
                          </Alert>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 p-0">
                      <Button
                        type="submit"
                        className="w-full cursor-pointer"
                        disabled={isForgotPasswordPending}
                      >
                        {isForgotPasswordPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isForgotPasswordPending ? 'Processing' : 'Send OTP'}
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
                )}

                {step === 2 && (
                  <form
                    action={resetPasswordActionWithState}
                    autoComplete="on"
                    className="flex flex-col gap-8"
                  >
                    <CardContent className="space-y-4 p-0">
                      <input type="hidden" name="email" value={email} />
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
                        <div className="flex items-center justify-between text-sm">
                          <Button
                            type="button"
                            variant="link"
                            className="px-0 h-auto text-xs cursor-pointer"
                            onClick={handleResendCode}
                            disabled={
                              resendCount >= 3 ||
                              countdown > 0 ||
                              isForgotPasswordPending
                            }
                          >
                            Resend code
                          </Button>
                          {countdown > 0 && (
                            <span className="text-muted-foreground text-xs">
                              {formatCountdown(countdown)}
                            </span>
                          )}
                          {resendCount >= 3 && countdown === 0 && (
                            <span className="text-destructive text-xs">
                              Maximum resends reached
                            </span>
                          )}
                        </div>
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
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            required
                            id="confirmPassword"
                            minLength={6}
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 bg-transparent! !hover:bg-transparent cursor-pointer"
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

                      {resetPasswordState?.message && (
                        <Alert
                          variant={
                            'data' in resetPasswordState
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {'data' in resetPasswordState && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          <AlertDescription>
                            {resetPasswordState?.message ||
                              ('error' in resetPasswordState &&
                                resetPasswordState.error &&
                                (Array.isArray(resetPasswordState.error)
                                  ? resetPasswordState.error.join(', ')
                                  : typeof resetPasswordState.error === 'string'
                                    ? resetPasswordState.error
                                    : 'Invalid form data'))}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 p-0">
                      <Button
                        type="submit"
                        className="w-full cursor-pointer"
                        disabled={isResetPasswordPending}
                      >
                        {isResetPasswordPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isResetPasswordPending
                          ? 'Processing'
                          : 'Change Password'}
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
                )}
              </div>
            </div>
          </div>
          <Suspense
            fallback={
              <div className="relative hidden lg:flex flex-col items-center justify-center h-full border-l" />
            }
          >
            <GlobeCanvas />
          </Suspense>
        </div>
      </Card>
    </div>
  );
}
