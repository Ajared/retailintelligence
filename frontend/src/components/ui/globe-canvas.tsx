'use client';

import createGlobe, { type COBEOptions, type Marker } from 'cobe';
import { useRef, useEffect } from 'react';
import { useSpring } from '@react-spring/web';
import { cn } from '~/lib/utils';

export interface GlobeCanvasProps {
  width?: number;
  height?: number;
  phi?: number;
  theta?: number;
  mapSamples?: number | 'auto';
  mapBrightness?: number;
  mapBaseBrightness?: number;
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
  markers?: Marker[];
  diffuse?: number;
  devicePixelRatio?: number | 'auto';
  dark?: number;
  opacity?: number;
  offset?: [number, number];
  scale?: number;
  context?: WebGLContextAttributes;
  onRender?: (state: Record<string, unknown>) => void;
  className?: string;
  containerClassName?: string;
}

const DEFAULT_MARKERS: Marker[] = [
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
];

export function GlobeCanvas(props: GlobeCanvasProps) {
  const {
    width = 780,
    height = 780,
    phi: initialPhi = 0,
    theta = 0.1,
    mapSamples = 'auto',
    mapBrightness = 6,
    mapBaseBrightness,
    baseColor = [0.3, 0.3, 0.3],
    markerColor = [0.1, 0.8, 1],
    glowColor = [0.2, 0.2, 0.2],
    markers = DEFAULT_MARKERS,
    diffuse = 1.8,
    devicePixelRatio = 'auto',
    dark = 1,
    opacity,
    offset = [0, 300],
    scale,
    context,
    onRender,
    className,
    containerClassName,
  } = props;

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

  useEffect(() => {
    if (!canvasRef.current) return;

    let phi = initialPhi;
    const dpr = window.devicePixelRatio || 1;
    const effectiveMapSamples =
      mapSamples === 'auto'
        ? window.innerWidth < 768
          ? 20000
          : dpr > 1
            ? 60000
            : 30000
        : mapSamples;
    const effectiveDevicePixelRatio =
      devicePixelRatio === 'auto' ? Math.min(dpr, 2) : devicePixelRatio;

    const defaultOnRender = (state: Record<string, unknown>) => {
      if (!pointerInteracting.current) {
        phi += 0.005;
      }
      state.phi = phi + r.get();
    };

    const globeOptions: COBEOptions = {
      devicePixelRatio: effectiveDevicePixelRatio,
      width,
      height,
      phi: initialPhi,
      theta,
      dark,
      diffuse,
      mapSamples: effectiveMapSamples,
      mapBrightness,
      baseColor,
      markerColor,
      glowColor,
      offset,
      markers,
      onRender: onRender || defaultOnRender,
      ...(mapBaseBrightness !== undefined && { mapBaseBrightness }),
      ...(opacity !== undefined && { opacity }),
      ...(scale !== undefined && { scale }),
      ...(context !== undefined && { context }),
    };

    const globe = createGlobe(canvasRef.current, globeOptions);

    return () => {
      globe.destroy();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r]);

  return (
    <div
      className={cn(
        'relative hidden lg:flex flex-col items-center justify-center h-full border-l',
        containerClassName,
      )}
    >
      <canvas
        className={cn(
          'w-full h-full flex items-center justify-center',
          className,
        )}
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
            const delta = e.touches[0].clientX - pointerInteracting.current;
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
  );
}
