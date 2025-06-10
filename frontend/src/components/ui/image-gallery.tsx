'use client';

import type React from 'react';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from './button';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface ImageGalleryProps {
  images: string[];
  className?: string;
  altPrefix?: string;
}

export function ImageGallery({
  images,
  className,
  altPrefix = 'Image',
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      setSelectedIndex(null);
    }
  };

  return (
    <div className={className}>
      <div className="flex gap-2 flex-wrap">
        {images.map((photo, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className="relative w-32 h-32 overflow-hidden rounded border hover:opacity-90 transition-opacity"
            aria-label={`View ${altPrefix} ${idx + 1}`}
          >
            <Image
              src={photo}
              alt={`${altPrefix} ${idx + 1}`}
              className="object-cover"
              fill
              sizes="128px"
            />
          </button>
        ))}
      </div>

      <Dialog.Root
        open={selectedIndex !== null}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 bg-black/90 z-50 cursor-pointer"
            onClick={() => setSelectedIndex(null)}
          />
          <Dialog.Content
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <VisuallyHidden.Root>
              <Dialog.Title>
                {selectedIndex !== null
                  ? `${altPrefix} ${selectedIndex + 1}`
                  : 'Image Gallery'}
              </Dialog.Title>
            </VisuallyHidden.Root>

            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {selectedIndex !== null && (
                <>
                  <div className="flex-1 flex items-center justify-center w-full">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 text-white hover:bg-white/20"
                      onClick={handlePrevious}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <div className="relative w-full h-full max-w-4xl max-h-[80vh] mx-16">
                      <Image
                        src={images[selectedIndex]}
                        alt={`${altPrefix} ${selectedIndex + 1}`}
                        className="object-contain"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                        priority={true}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 text-white hover:bg-white/20"
                      onClick={handleNext}
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 text-white hover:bg-white/20"
                      onClick={() => setSelectedIndex(null)}
                      aria-label="Close gallery"
                    >
                      <X className="h-8 w-8" />
                    </Button>
                  </div>
                  <div className="w-full max-w-4xl px-16 py-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 items-center justify-center">
                      {images.map((photo, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedIndex(idx)}
                          className={`relative w-20 h-20 flex-shrink-0 overflow-hidden rounded border transition-all ${
                            idx === selectedIndex
                              ? 'ring-2 ring-primary'
                              : 'hover:opacity-90'
                          }`}
                          aria-label={`View ${altPrefix} ${idx + 1}`}
                          aria-current={
                            idx === selectedIndex ? 'true' : 'false'
                          }
                        >
                          <Image
                            src={photo}
                            alt={`${altPrefix} ${idx + 1} thumbnail`}
                            className="object-cover"
                            fill
                            sizes="80px"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
