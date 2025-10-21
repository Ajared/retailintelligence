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
import { forgotPasswordAction } from '../actions';
import { ForgotPasswordFormData } from '../schema';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useActionState, lazy, Suspense } from 'react';
import { Alert, AlertDescription } from '~/components/ui/alert';

const GlobeCanvas = lazy(() =>
  import('~/components/ui/globe-canvas').then((mod) => ({
    default: mod.GlobeCanvas,
  })),
);

export function ForgotPasswordForm() {
  const initialState: Response<{ email: string }> & {
    inputs: ForgotPasswordFormData;
  } = {
    inputs: {
      email: '',
    },
    error: '',
    message: '',
    timestamp: '',
  };

  const [state, action, isPending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <div className="w-full max-w-4xl">
      <Link
        href="/"
        className="flex items-center justify-center text-2xl font-bold text-center mb-8"
      >
        Retail Intelligence
      </Link>
      <Card className="bg-card overflow-hidden rounded-lg border shadow-2xl p-0">
        <div className="grid min-h-[360px] lg:min-h-[480px] lg:grid-cols-2">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
            <div className="mx-auto w-full max-w-sm">
              <div className="space-y-8">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl font-bold text-center">
                    Forgot Password
                  </CardTitle>
                  <CardDescription className="text-center">
                    Enter your email to reset your password.
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
                  <p
                    className={`${'data' in state && state.data?.email ? 'text-center text-sm' : 'hidden'}`}
                  >
                    {'data' in state && state.data?.email ? (
                      <span>
                        We&apos;ve sent an email to{' '}
                        <span className="font-bold">{state.data?.email}</span>
                      </span>
                    ) : (
                      ''
                    )}
                  </p>
                  <CardFooter className="flex flex-col gap-2 p-0">
                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      disabled={isPending}
                    >
                      {isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isPending ? 'Processing' : 'Reset Password'}
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
            <GlobeCanvas />
          </Suspense>
        </div>
      </Card>
    </div>
  );
}
