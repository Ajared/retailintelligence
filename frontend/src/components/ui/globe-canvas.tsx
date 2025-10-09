'use client';

import createGlobe from 'cobe';
import { useRef, useEffect } from 'react';
import { useSpring } from '@react-spring/web';

export function GlobeCanvas() {
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
  }, [r]);

  return (
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
