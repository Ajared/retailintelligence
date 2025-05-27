'use client';

import type React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { loginAction } from '../actions';
import { Response } from '~/types/actions';
import { useRouter } from 'next/navigation';
import { UserInterface } from '~/types/user';
import { LoginFormData } from '../schema';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { useActionState, useState } from 'react';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const initialState: Response<UserInterface & { access_token: string }> & {
    inputs: LoginFormData;
  } = {
    inputs: {
      email: '',
      password: '',
    },
    error: '',
    message: '',
    timestamp: '',
  };

  const [state, action, isPending] = useActionState(loginAction, initialState);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your password to get started with your account
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
              defaultValue={('inputs' in state && state.inputs?.email) || ''}
              required
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

          {state?.message && (
            <Alert variant={'data' in state ? 'default' : 'destructive'}>
              {'data' in state && <CheckCircle2 className="h-4 w-4" />}
              <AlertDescription>
                {('error' in state &&
                  state.error &&
                  (Array.isArray(state.error)
                    ? (state.error as string[]).join(', ')
                    : typeof state.error === 'string'
                      ? state.error
                      : 'Invalid form data')) ||
                  state?.message}
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
            {isPending ? 'Processing' : 'Sign In'}
          </Button>
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={() => router.push('/register')}
            >
              Create an account
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
