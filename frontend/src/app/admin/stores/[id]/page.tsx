import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '~/components/ui/button';
import EmptyState from '../../_components/empty';
import { getStoreById } from '~/app/admin/actions';
import { ImageGallery } from '~/components/ui/image-gallery';

export default async function StoreDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getStoreById(id);

  if (!response || !('data' in response)) {
    return <EmptyState />;
  }

  const store = response.data;

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <Button asChild variant="outline">
        <Link href="/admin/stores" className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          All Stores
        </Link>
      </Button>
      <div className="space-y-4 border rounded-md p-6 bg-background">
        <h2 className="text-2xl font-bold mb-2">{store.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground text-sm">Type</div>
            <div>{store.store_type}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm">Address</div>
            <div>{store.address}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm">State</div>
            <div>{store?.state?.name}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm">
              Local Government
            </div>
            <div>{store?.local_government?.name}</div>
          </div>
          {store.phase && (
            <div>
              <div className="text-muted-foreground text-sm">Phase</div>
              <div>{store?.phase?.name}</div>
            </div>
          )}
          {store.district && (
            <div>
              <div className="text-muted-foreground text-sm">District</div>
              <div>{store?.district?.name}</div>
            </div>
          )}
          <div>
            <div className="text-muted-foreground text-sm">Landmarks</div>
            <div>{store.landmarks || '-'}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm">Enumerator</div>
            <div>{store.enumerator?.email || '-'}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm">Latitude</div>
            <div>{store.latitude}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm">Longitude</div>
            <div>{store.longitude}</div>
          </div>
        </div>
        {store.photos && store.photos.length > 0 && (
          <div>
            <div className="text-muted-foreground text-sm mb-1">Photos</div>
            <ImageGallery images={store.photos} altPrefix={store.name} />
          </div>
        )}
      </div>
    </div>
  );
}
