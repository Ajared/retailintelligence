'use client';

import {
  useActionState,
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  startTransition,
} from 'react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '~/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { addStore } from '../../actions';
import type { Response } from '~/types/actions';
import { Alert, AlertDescription } from '~/components/ui/alert';
import {
  CheckCircle2,
  Loader2,
  MapPin,
  ImageIcon,
  X,
  Plus,
  ChevronLeft,
} from 'lucide-react';
import type { StoreInterface } from '~/types/store';
import type { StateInterface } from '~/types/state';
import { AddStoreFormData } from '../../schema';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';

function ImagePreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setIsLoading(false);
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [file]);

  return (
    <div className="relative group">
      <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        ) : preview ? (
          <Image
            src={preview}
            alt={file.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>
      <Button
        variant="destructive"
        size="icon"
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 w-6 h-6 dark:bg-red-600 dark:hover:bg-red-700"
        aria-label={`Remove ${file.name}`}
      >
        <X className="w-3 h-3" />
      </Button>
      <p
        className="text-xs text-gray-500 mt-1 truncate max-w-20"
        title={file.name}
      >
        {file.name}
      </p>
    </div>
  );
}

export function AddStoreForm({ locations }: { locations: StateInterface[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const initialState: Response<StoreInterface> & {
    inputs: AddStoreFormData;
  } = {
    error: '',
    message: '',
    timestamp: '',
    inputs: {
      name: '',
      state_id: '',
      local_government_id: '',
      address: '',
      store_type: '',
      latitude: 0,
      longitude: 0,
      landmarks: '',
      photos: [],
    },
  };

  const [state, action, isPending] = useActionState(addStore, initialState);

  const filteredLocalGovernments = useMemo(() => {
    if (!selectedStateId) return [];
    const selectedState = locations.find(
      (state) => state.id === selectedStateId,
    );
    return selectedState?.local_governments || [];
  }, [selectedStateId, locations]);

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationData({ latitude, longitude });
        setIsGettingLocation(false);
      },
      (error) => {
        toast.error(`Error getting location: ${error.message}`);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }, []);

  const getInputValue = useCallback(
    (key: keyof AddStoreFormData): string => {
      if (
        state &&
        typeof state === 'object' &&
        'inputs' in state &&
        state.inputs &&
        state.inputs[key] !== undefined
      ) {
        return String(state.inputs[key]);
      }
      return '';
    },
    [state],
  );

  const handleImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;
      startTransition(() => {
        if (selectedImages.length === 0 && files.length > 10) {
          toast.info(
            `Only the first 10 images will be added. ${files.length - 10} images will be discarded.`,
          );
        } else if (selectedImages.length + files.length > 10) {
          toast.error(
            `Cannot add ${files.length} images. Only ${10 - selectedImages.length} more images allowed.`,
          );
          return;
        }

        const newFiles = Array.from(files).filter((file) => {
          if (!file.type.startsWith('image/')) {
            toast.error(`${file.name} is not an image file`);
            return false;
          }
          if (file.size > 4 * 1024 * 1024) {
            toast.error(`${file.name} is too large. Maximum size is 4MB`);
            return false;
          }
          if (
            selectedImages.some(
              (existing) =>
                existing.name === file.name && existing.size === file.size,
            )
          ) {
            toast.error(`${file.name} is already selected`);
            return false;
          }
          return true;
        });

        if (selectedImages.length === 0 && newFiles.length > 10) {
          setSelectedImages(newFiles.slice(0, 10));
        } else if (newFiles.length > 0) {
          setSelectedImages((prev) => [...prev, ...newFiles]);
        }
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [selectedImages],
  );

  const removeImage = useCallback((index: number) => {
    setSelectedImages((prev) => {
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleAddMoreImages = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      if (
        !locationData ||
        (locationData.latitude === 0 && locationData.longitude === 0)
      ) {
        toast.warning('Please attach your current location');
        return;
      }

      formData.set('latitude', locationData.latitude.toString());
      formData.set('longitude', locationData.longitude.toString());
      formData.delete('photos');
      selectedImages.forEach((file) => {
        formData.append('photos', file);
      });
      startTransition(() => {
        action(formData);
      });
    },
    [action, selectedImages, locationData],
  );

  const handleStateChange = useCallback((value: string) => {
    setSelectedStateId(value);
    const form = formRef.current;
    if (form) {
      const lgSelect = form.querySelector(
        'input[name="local_government_id"]',
      ) as HTMLInputElement;
      if (lgSelect) {
        lgSelect.value = '';
      }
    }
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-2">
          <CardTitle>Add Store</CardTitle>
          <CardDescription>
            Fill in the details to add a new store.
          </CardDescription>
        </div>
        <Button asChild variant="outline">
          <Link href="/user/stores" className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            <span className="block md:hidden">Back</span>
            <span className="hidden md:block">Back to Stores</span>
          </Link>
        </Button>
      </CardHeader>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Store Name *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={getInputValue('name')}
              placeholder="Enter store name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="store_type">Store Type *</Label>
            <Input
              id="store_type"
              name="store_type"
              required
              placeholder="e.g. Supermarket, Pharmacy, Boutique, etc."
              defaultValue={getInputValue('store_type')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              name="address"
              required
              defaultValue={getInputValue('address')}
              placeholder="Enter store address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="landmarks">Landmarks</Label>
            <Input
              id="landmarks"
              name="landmarks"
              defaultValue={getInputValue('landmarks')}
              placeholder="e.g. Near the market, Beside the school, etc."
            />
          </div>

          <div className="flex flex-row gap-4 w-full">
            <div className="space-y-2 w-full">
              <Label htmlFor="state_id">State *</Label>
              <Select
                name="state_id"
                required
                defaultValue={getInputValue('state_id')}
                onValueChange={handleStateChange}
              >
                <SelectTrigger id="state_id" className="w-full">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((state) => (
                    <SelectItem key={state.id} value={state.id!}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="local_government_id">Local Government *</Label>
              <Select
                name="local_government_id"
                required
                defaultValue={getInputValue('local_government_id')}
                disabled={!selectedStateId}
              >
                <SelectTrigger id="local_government_id" className="w-full">
                  <SelectValue
                    placeholder={
                      selectedStateId
                        ? 'Select a local government'
                        : 'Select a state first'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredLocalGovernments.map((lg) => (
                    <SelectItem key={lg.id!} value={lg.id!}>
                      {lg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-row gap-4 w-full">
            <div className="space-y-2 w-full">
              <Label>Location *</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  variant="outline"
                  className="flex items-center justify-start gap-2 w-full"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {isGettingLocation
                    ? 'Getting Location...'
                    : locationData
                      ? `Location Captured (${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)})`
                      : 'Attach Current Location'}
                </Button>
              </div>
              <input
                type="hidden"
                name="latitude"
                value={String(
                  locationData?.latitude !== undefined
                    ? locationData.latitude
                    : getInputValue('latitude') || '',
                )}
                required
              />
              <input
                type="hidden"
                name="longitude"
                value={String(
                  locationData?.longitude !== undefined
                    ? locationData.longitude
                    : getInputValue('longitude') || '',
                )}
                required
              />
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="zip_code">Postal/Zip Code *</Label>
              <Input
                id="zip_code"
                name="zip_code"
                placeholder="10001"
                required
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="postal-code"
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== 'Backspace' &&
                    e.key !== 'Delete' &&
                    e.key !== 'ArrowLeft' &&
                    e.key !== 'ArrowRight' &&
                    e.key !== 'Tab'
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Photos</Label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {selectedImages.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  {selectedImages.map((file, index) => (
                    <ImagePreview
                      key={`${file.name}-${file.size}-${index}`}
                      file={file}
                      onRemove={() => removeImage(index)}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedImages.length} image
                  {selectedImages.length !== 1 ? 's' : ''} selected
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddMoreImages}
              disabled={selectedImages.length >= 10}
              className="w-full border-dashed border-2 h-24 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                {selectedImages.length === 0 ? (
                  <>
                    <ImageIcon className="h-5 w-5" />
                    <span>Select Images</span>
                  </>
                ) : selectedImages.length >= 10 ? (
                  <>
                    <ImageIcon className="h-5 w-5" />
                    <span>Maximum Images Reached</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Add More Images</span>
                  </>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {selectedImages.length >= 10
                  ? 'Maximum of 10 images allowed'
                  : 'Click to browse or drag and drop'}
              </span>
            </Button>

            <p className="text-xs text-muted-foreground">
              JPG, PNG, GIF, WebP • Max 4MB each • Up to 10 images
            </p>
          </div>

          {state?.message && (
            <Alert variant={'data' in state ? 'default' : 'destructive'}>
              {'data' in state && <CheckCircle2 className="h-4 w-4" />}
              <AlertDescription
                className={
                  'error' in state && state.error
                    ? 'text-red-500 dark:text-red-400'
                    : ''
                }
              >
                {state &&
                typeof state === 'object' &&
                'error' in state &&
                state.error
                  ? Array.isArray(state.error)
                    ? state.error.join(', ')
                    : typeof state.error === 'string'
                      ? state.error
                      : 'Invalid form data'
                  : state.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Processing' : 'Add Store'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
