// keep this file's existing imports
import { checkAvailability } from '../../api/public';

type Customer = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  gdpr?: boolean;
};

type EnsureNextWebParams = {
  venue_id: string;
  num_people: number;
  date: string; // YYYY-MM-DD
  time: string; // label or ISO per DMN
  type: string; // experience id
  packages?: string[]; // optional
  customer?: Customer; // optional
};

export async function getNextWebUrl(p: EnsureNextWebParams): Promise<string | null> {
  const r = await checkAvailability(p as any);

  // tolerate multiple response shapes without referencing API types
  const payload = (r as any)?.payload ?? (r as any)?.data?.payload ?? (r as any)?.data ?? r;

  const nextWeb: string | undefined = payload?.next?.web ?? payload?.next?.hosted; // some APIs use "hosted"

  return typeof nextWeb === 'string' && nextWeb.length > 0 ? nextWeb : null;
}

export function withReturnUrl(nextWeb: string, returnUrl?: string | null): string {
  try {
    const u = new URL(nextWeb);
    if (returnUrl) u.searchParams.set('return_url', returnUrl);
    return u.toString();
  } catch {
    // handle relative URLs
    if (!returnUrl) return nextWeb;
    const sep = nextWeb.includes('?') ? '&' : '?';
    return `${nextWeb}${sep}return_url=${encodeURIComponent(returnUrl)}`;
  }
}
