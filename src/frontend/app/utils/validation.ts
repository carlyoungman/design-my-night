import type { Customer } from '@app/state';

export type UiType = {
  id: string;
  name: string;
  description?: string;
  priceText?: string;
  valid: boolean;
  message?: string | null;
};

export function normalizeTypeSuggestions(validation: unknown): UiType[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = (validation ?? {}) as Record<string, any>;
  const sv = v?.type?.suggestedValues ?? [];
  if (!Array.isArray(sv)) return [];

  return (
    sv
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => {
        // Accept both: "Sunny Brunch"  OR  { value:{id,name,...}, valid, message }
        const value = item && typeof item === 'object' && 'value' in item ? item.value : item;

        if (typeof value === 'string') {
          return { id: value, name: value, valid: true, message: null } as UiType;
        }
        if (value && typeof value === 'object') {
          return {
            id: String(value.id),
            name: String(value.name ?? value.id),
            valid: Boolean(item?.valid ?? true),
            message: item?.message ?? null,
          } as UiType;
        }
        return null;
      })
      .filter(Boolean) as UiType[]
  );
}

/* ---------- Customer details ---------- */

export const MAX_MESSAGE = 500;

export type CustomerField = 'first_name' | 'last_name' | 'email' | 'phone' | 'message';

export type CustomerErrors = Partial<Record<CustomerField, string>>;

/**
 * Single source of truth for the Details step. Used by the step itself, the progress bar
 * and the Review button so they always agree on what "complete" means.
 */
export function validateCustomer(c: Partial<Customer> | undefined): CustomerErrors {
  const errors: CustomerErrors = {};
  const first = (c?.first_name || '').trim();
  const last = (c?.last_name || '').trim();
  const email = (c?.email || '').trim();
  const phone = (c?.phone || '').trim();

  if (first.length < 2) errors.first_name = 'Enter your first name (at least 2 letters).';
  if (last.length < 2) errors.last_name = 'Enter your last name (at least 2 letters).';
  if (!email) errors.email = 'Enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Enter an email address like name@example.com.';
  if (!phone) errors.phone = 'Enter your phone number.';
  else if (!/^[\d\s()+-]{6,20}$/.test(phone))
    errors.phone = 'Enter a phone number using digits, spaces, +, ( ) or - (6 to 20 characters).';
  if ((c?.message || '').length > MAX_MESSAGE)
    errors.message = `Special requests must be ${MAX_MESSAGE} characters or fewer.`;

  return errors;
}

export const isCustomerValid = (c: Partial<Customer> | undefined) =>
  Object.keys(validateCustomer(c)).length === 0;
