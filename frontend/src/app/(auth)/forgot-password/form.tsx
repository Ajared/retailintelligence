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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [{ r }, api] = useSpring(() => ({
    r: 0,
    config: {
      mass: 1,
      tension: 280,
      friction: 40,
      precision: 0.001,
    },
  }));

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

  useEffect(() => {
    if (!canvasRef.current) return;
    let phi = 0;
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 1200,
      height: 1200,
      phi: 0,
      theta: 0.1,
      dark: 1,
      diffuse: 1.8,
      mapSamples: 60000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [0.2, 0.2, 0.2],
      scale: 1.35,
      offset: [241.5, 176.9],
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.03 },
        { location: [34.0522, -118.2437], size: 0.03 },
        { location: [41.8781, -87.6298], size: 0.03 },
        { location: [29.7604, -95.3698], size: 0.03 },
        { location: [33.4484, -112.074], size: 0.03 },
        { location: [39.7392, -104.9903], size: 0.03 },
        { location: [47.6062, -122.3321], size: 0.03 },
        { location: [32.5149, -117.0382], size: 0.03 },
        { location: [-18.8792, 47.5079], size: 0.03 },
        { location: [-20.1609, 57.5012], size: 0.03 },
        { location: [-4.3217, 15.3125], size: 0.03 },
        { location: [4.3947, 18.5582], size: 0.03 },
        { location: [1.6596, 10.1574], size: 0.03 },
        { location: [-0.228, 15.8277], size: 0.03 },
        { location: [3.848, 11.5021], size: 0.03 },
        { location: [12.1348, 15.0557], size: 0.03 },
        { location: [-33.8688, 151.2093], size: 0.03 },
        { location: [-37.8136, 144.9631], size: 0.03 },
        { location: [-41.2865, 174.7762], size: 0.03 },
        { location: [-36.8485, 174.7633], size: 0.03 },
        { location: [-43.5321, 172.6362], size: 0.03 },
        { location: [-9.4438, 147.1803], size: 0.03 },
        { location: [-18.1416, 178.4419], size: 0.03 },
        { location: [-13.8333, -171.75], size: 0.03 },
      ],
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phi += 0.005;
        }
        state.phi = phi + r.get();
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

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
              defaultValue={('inputs' in state && state.inputs?.email) || ''}
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
                  <CardFooter className="flex flex-col gap-2 p-0">
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
              </div>
            </div>
          </div>
          <div className="relative hidden lg:flex flex-col items-center justify-center h-full border-l">
            <canvas
              ref={canvasRef}
              onPointerDown={(e) => {
                pointerInteracting.current =
                  e.clientX - pointerInteractionMovement.current;
                if (canvasRef.current) {
                  canvasRef.current.style.cursor = 'grabbing';
                }
              }}
              onPointerUp={() => {
                pointerInteracting.current = null;
                if (canvasRef.current) {
                  canvasRef.current.style.cursor = 'grab';
                }
              }}
              onPointerOut={() => {
                pointerInteracting.current = null;
                if (canvasRef.current) {
                  canvasRef.current.style.cursor = 'grab';
                }
              }}
              onMouseMove={(e) => {
                if (pointerInteracting.current !== null) {
                  const delta = e.clientX - pointerInteracting.current;
                  pointerInteractionMovement.current = delta;
                  api.start({
                    r: delta / 200,
                  });
                }
              }}
              onTouchMove={(e) => {
                if (pointerInteracting.current !== null && e.touches[0]) {
                  const delta =
                    e.touches[0].clientX - pointerInteracting.current;
                  pointerInteractionMovement.current = delta;
                  api.start({
                    r: delta / 100,
                  });
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                aspectRatio: 1,
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
