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
import { useActionState, useRef, useEffect } from 'react';
import { Response } from '~/types/actions';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { forgotPasswordAction } from '../actions';
import { ForgotPasswordFormData } from '../schema';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '~/components/ui/alert';
import createGlobe from 'cobe';
import { useSpring } from '@react-spring/web';

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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to reset your password.
        </CardDescription>
      </CardHeader>
      <form action={action} autoComplete="on" className="flex flex-col gap-4">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              defaultValue={('inputs' in state && state.inputs?.email) || ''}
              required
            />
          </div>

          {state?.message && (
            <Alert variant={'data' in state ? 'default' : 'destructive'}>
              {'data' in state && <CheckCircle2 className="h-4 w-4" />}
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
        <p className="text-center text-sm">
          {'data' in state && state.data?.email ? (
            <span>
              We&apos;ve sent an email to{' '}
              <span className="font-bold">{state.data?.email}</span>
            </span>
          ) : (
            ''
          )}
        </p>
        <CardFooter className="flex flex-col gap-2">
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
    </Card>
  );
}
