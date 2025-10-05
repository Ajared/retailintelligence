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
import { registerUser } from '../actions';
import { Response } from '~/types/actions';
import { UserInterface } from '~/types/user';
import { RegisterFormData } from '../schema';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { useActionState, useState } from 'react';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';

export function RegisterForm({
  email,
  inviteToken,
  isValidToken,
}: {
  email: string;
  inviteToken: string;
  isValidToken: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const initialState: Response<UserInterface> & { inputs: RegisterFormData } = {
    inputs: {
      email: '',
      password: '',
      confirmPassword: '',
      inviteToken: '',
    },
    error: '',
    message: '',
    timestamp: '',
  };

  const [state, action, isPending] = useActionState(registerUser, initialState);

  if (inviteToken && !isValidToken) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invalid Invitation</CardTitle>
          <CardDescription>
            The invitation token is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full cursor-pointer">
            <Link href="/login">Login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          {email
            ? 'Enter your password to get started with your account'
            : 'Enter your details to create a new account'}
        </CardDescription>
      </CardHeader>
      <form action={action} autoComplete="on" className="flex flex-col gap-5">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              defaultValue={
                email || ('inputs' in state && state.inputs?.email) || ''
              }
              autoFocus
              readOnly={!!email}
              required
              tabIndex={email ? -1 : undefined}
              style={email ? { userSelect: 'none' } : undefined}
              onFocus={email ? (e) => e.target.blur() : undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                minLength={6}
                defaultValue={
                  ('inputs' in state && state.inputs?.password) || ''
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                minLength={6}
                defaultValue={
                  ('inputs' in state && state.inputs?.confirmPassword) || ''
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 !bg-transparent !hover:bg-transparent cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </div>

          <input
            type="hidden"
            name="inviteToken"
            defaultValue={
              inviteToken ||
              ('inputs' in state && state.inputs?.inviteToken) ||
              ''
            }
          />

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

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Processing' : 'Create Account'}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Button variant="link" className="px-0 cursor-pointer" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
