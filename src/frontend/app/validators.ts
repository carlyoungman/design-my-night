import { z } from 'zod';

export const AvailabilityResponseZ = z.object({
  available: z.boolean(),
  slots: z.array(z.object({ time: z.string(), label: z.string().optional() })).optional(),
  message: z.string().optional(),
});
