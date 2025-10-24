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
import type { PhaseInterface } from '~/types/phase';
import { UserInterface } from '~/types/user';

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

export function AddStoreForm({
  phases,
  locations,
  user,
}: {
  phases: PhaseInterface[];
  locations: StateInterface[];
  user?: UserInterface;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string | undefined>(
    user?.assigned_state_id || '',
  );
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | undefined>(
    user?.assigned_phase_id || '',
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<
    string | undefined
  >(user?.assigned_district_id || '');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const latitudeRef = useRef<HTMLInputElement>(null);
  const longitudeRef = useRef<HTMLInputElement>(null);

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
      store_type_description: '',
      latitude: 0,
      longitude: 0,
      landmarks: '',
      photos: [],
    },
  };

  const [state, action, isPending] = useActionState(addStore, initialState);

  const [selectedStoreType, setSelectedStoreType] = useState<string>('');

  // Initialize selectedStoreType from form state
  useEffect(() => {
    const storeType = getInputValue('store_type');
    if (storeType) {
      setSelectedStoreType(storeType);
    }
  }, [state]);

  const selectedState = useMemo(() => {
    return locations.find((state) => state.id === selectedStateId);
  }, [selectedStateId, locations]);

  const showPhaseAndDistrict = useMemo(() => {
    if (!selectedState) return false;
    return (
      selectedState.name === 'FCT Abuja' ||
      selectedState.id === phases[0]?.state_id
    );
  }, [selectedState, phases]);

  const filteredLocalGovernments = useMemo(() => {
    if (!selectedStateId) return [];
    return selectedState?.local_governments || [];
  }, [selectedStateId, selectedState]);

  const filteredDistricts = useMemo(() => {
    if (!showPhaseAndDistrict || !selectedPhaseId) return [];
    const phase = phases.find((p) => p.id === selectedPhaseId);
    return phase?.districts || [];
  }, [showPhaseAndDistrict, selectedPhaseId, phases]);

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (latitudeRef.current) {
          latitudeRef.current.value = latitude.toString();
        }
        if (longitudeRef.current) {
          longitudeRef.current.value = longitude.toString();
        }
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
      const latInput = latitudeRef.current?.value ?? '';
      const lngInput = longitudeRef.current?.value ?? '';
      if (latInput.trim().length > 0) formData.set('latitude', latInput.trim());
      if (lngInput.trim().length > 0)
        formData.set('longitude', lngInput.trim());
      formData.delete('photos');
      selectedImages.forEach((file) => {
        formData.append('photos', file);
      });
      startTransition(() => {
        action(formData);
      });
    },
    [action, selectedImages],
  );

  const handleStateChange = useCallback(
    (value: string) => {
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

      const state = locations.find((s) => s.id === value);
      if (
        !state ||
        (state.name !== 'FCT Abuja' && state.id !== phases[0]?.state_id)
      ) {
        setSelectedPhaseId('');
        setSelectedDistrictId('');
      }
    },
    [locations, phases],
  );

  const handlePhaseChange = useCallback((value: string) => {
    setSelectedPhaseId(value);
    setSelectedDistrictId('');
  }, []);

  const handleDistrictChange = useCallback((value: string) => {
    setSelectedDistrictId(value);
  }, []);

  const handleStoreTypeChange = useCallback((value: string) => {
    setSelectedStoreType(value);
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
            <Select
              name="store_type"
              required
              defaultValue={getInputValue('store_type')}
              onValueChange={handleStoreTypeChange}
            >
              <SelectTrigger id="store_type" className="w-full">
                <SelectValue placeholder="Select a store type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SHOP">Shop</SelectItem>
                <SelectItem value="REFUSE_SITE">Refuse Site</SelectItem>
                <SelectItem value="SCHOOL">School</SelectItem>
                <SelectItem value="HOSPITAL">Hospital</SelectItem>
                <SelectItem value="BAR_RESTAURANT">Bar / Restaurant</SelectItem>
                <SelectItem value="FUELING_STATION">Fueling Station</SelectItem>
                <SelectItem value="HOTEL">Hotel</SelectItem>
                <SelectItem value="RECREATION_PARK">Recreation Park</SelectItem>
                <SelectItem value="FINANCIAL_INSTITUTION">
                  Financial Institution
                </SelectItem>
                <SelectItem value="RELIGIOUS">Religious Centre</SelectItem>
                <SelectItem value="OTHER">Other (Specify)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(selectedStoreType === 'SHOP' || selectedStoreType === 'OTHER') && (
            <div className="space-y-2">
              <Label htmlFor="store_type_description">
                Store Type Description *
              </Label>
              <Input
                id="store_type_description"
                name="store_type_description"
                required
                placeholder="Describe the type of shop or other business..."
                defaultValue={getInputValue('store_type_description')}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Please provide a detailed description of your store type (1-500
                characters)
              </p>
            </div>
          )}

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
                defaultValue={
                  user?.assigned_state_id || getInputValue('state_id')
                }
                onValueChange={handleStateChange}
                disabled={!!user?.assigned_state_id}
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
                value={
                  user?.assigned_local_government_id ||
                  selectedDistrictId ||
                  getInputValue('local_government_id')
                }
                onValueChange={setSelectedDistrictId}
                disabled={
                  !selectedStateId || !!user?.assigned_local_government_id
                }
              >
                <SelectTrigger id="local_government_id" className="w-full">
                  <SelectValue
                    placeholder={
                      selectedStateId
                        ? 'Select a local government'
                        : 'Select a state first'
                    }
                  >
                    {user?.assigned_local_government_id
                      ? filteredLocalGovernments.find(
                          (lg) => lg.id === user.assigned_local_government_id,
                        )?.name
                      : undefined}
                  </SelectValue>
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

          {showPhaseAndDistrict || user?.assigned_phase_id ? (
            <div className="flex flex-row gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="phase_id">Phase *</Label>
                <Select
                  name="phase_id"
                  required
                  value={user?.assigned_phase_id || selectedPhaseId}
                  onValueChange={handlePhaseChange}
                  disabled={!!user?.assigned_phase_id}
                >
                  <SelectTrigger id="phase_id" className="w-full">
                    <SelectValue placeholder="Select a phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map((phase) => (
                      <SelectItem key={phase.id} value={phase.id!}>
                        {phase.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="district_id">District *</Label>
                <Select
                  name="district_id"
                  required
                  value={user?.assigned_district_id || selectedDistrictId}
                  onValueChange={handleDistrictChange}
                  disabled={!selectedPhaseId || !!user?.assigned_district_id}
                >
                  <SelectTrigger id="district_id" className="w-full">
                    <SelectValue
                      placeholder={
                        selectedPhaseId
                          ? 'Select a district'
                          : 'Select a phase first'
                      }
                    >
                      {user?.assigned_district_id
                        ? filteredDistricts.find(
                            (d) => d.id === user.assigned_district_id,
                          )?.name
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDistricts.map((district) => (
                      <SelectItem key={district.id!} value={district.id!}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          <div className="flex flex-row gap-4 w-full">
            <div className="space-y-2 w-full">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                name="latitude"
                defaultValue={String(getInputValue('latitude') || '')}
                placeholder="e.g. 4.8156"
                inputMode="decimal"
                ref={latitudeRef}
              />
            </div>
            <div className="space-y-2 w-full">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                name="longitude"
                defaultValue={String(getInputValue('longitude') || '')}
                placeholder="e.g. 7.0333"
                inputMode="decimal"
                ref={longitudeRef}
              />
            </div>
          </div>

          <div className="flex flex-row gap-4 w-full">
            <div className="space-y-2 w-full">
              <Label>Quick Action</Label>
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
                Use Current Location
              </Button>
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="zip_code">Postal/Zip Code</Label>
              <Input
                id="zip_code"
                name="zip_code"
                placeholder="10001"
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
