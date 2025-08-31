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
