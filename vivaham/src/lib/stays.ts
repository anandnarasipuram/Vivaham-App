import { rows } from './data';
import { supabase } from './supabase';

export type GuestOption = { id: string; name: string; people: number };

export async function fetchGuestOptions(): Promise<GuestOption[]> {
  const [guests, invites] = await Promise.all([
    rows<{ id: string; name: string }>(supabase.from('guests').select('id, name').order('name')),
    rows<{ guest_id: string; party_size: number | null }>(supabase.from('guest_events').select('guest_id, party_size')),
  ]);
  const sizes = new Map<string, number>();
  invites.forEach((invite) => {
    sizes.set(invite.guest_id, Math.max(sizes.get(invite.guest_id) ?? 1, invite.party_size ?? 1));
  });
  return guests.map((guest) => ({ ...guest, people: sizes.get(guest.id) ?? 1 }));
}

export function mapsLink(mapsUrl: string | null, address: string | null, name: string) {
  if (mapsUrl) {
    return mapsUrl;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || name)}`;
}
