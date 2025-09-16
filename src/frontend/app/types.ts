export type AvailabilityValidationField = {
  suggestedValues?: string[];
  message?: string;
};

export type AvailabilityValidation = {
  time?: AvailabilityValidationField;
  booking_time?: AvailabilityValidationField;
  [key: string]: unknown; // keep future-proof
};

export type AvailabilityRes = {
  payload: {
    valid: boolean;
    validation?: AvailabilityValidation;
    action?: 'accept' | 'enquire' | 'may_enquire' | 'reject';
    next?: { web?: string; api?: string };
    bookingDetails?: Record<string, unknown>;
  };
  status: number;
};
export type Venue = {
  _id: string;
  title: string;
  name?: string;
};

export type VenueStepProps = {
  venues: Venue[];
  initialLoading: boolean;
  error: string | null;
  forcedVenueId?: string;
};
export type AddOnPackage = {
  id: string;
  name: string;
  description?: string;
  image_url?: string | null;
  priceText?: string | null;
  visible?: boolean;
  dmn_package_id?: string | null;
};
export type AdminPackage = {
  id?: number; // WP post ID
  name: string;
  description?: string;
  priceText?: string | null;
  visible?: boolean;
  image_id?: number | null;
  image_url?: string | null;
  venueIds: string[]; // DMN venue IDs this add-on applies to
};
