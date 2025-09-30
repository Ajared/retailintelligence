'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { StoreInterface } from '~/types/store';

export default function StoreDetailsDialog({
  open,
  onOpenChange,
  store,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: StoreInterface | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl h-auto max-h-[85vh] overflow-y-auto"
        aria-describedby={undefined}
      >
        {store && (
          <div className="space-y-6 min-w-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl break-words">
                {store.name}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-muted-foreground text-sm">Type</div>
                  <div className="font-medium break-words">
                    {store.store_type}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">State</div>
                  <div className="font-medium break-words">
                    {store.state?.name}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Landmarks</div>
                  <div className="font-medium break-words">
                    {store.landmarks || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Latitude</div>
                  <div className="font-medium break-words">
                    {store.latitude}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-muted-foreground text-sm">Address</div>
                  <div className="font-medium break-words">{store.address}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">
                    Local Government
                  </div>
                  <div className="font-medium break-words">
                    {store.local_government?.name}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">
                    Enumerator
                  </div>
                  <div className="font-medium break-words">
                    {store.enumerator?.email}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Longitude</div>
                  <div className="font-medium break-words">
                    {store.longitude}
                  </div>
                </div>
              </div>
            </div>

            {store.photos && store.photos.length > 0 && (
              <div>
                <div className="text-muted-foreground text-sm mb-2">Photos</div>
                <div className="flex w-full min-w-0 gap-3 overflow-x-auto overflow-y-hidden py-1 touch-pan-x">
                  {store.photos.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded border"
                    >
                      <Image
                        src={src}
                        alt={`${store.name} photo ${idx + 1}`}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
