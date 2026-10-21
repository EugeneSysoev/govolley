import type { z } from 'zod';
import type { bookingsSchema, Profile } from '@/lib/contracts';
export type Booking = z.infer<typeof bookingsSchema>[number];
export type ProfileUser = Omit<Profile, 'id'> & { id: string | number };
export interface ProfileFormData { firstName: string; lastName: string }
