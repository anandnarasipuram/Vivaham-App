import type { EventRow } from './data';

export type Invite = { event_id: string; rsvp: string; party_size: number | null };

export function foodPlan(event: EventRow, invites: Invite[]) {
  const mine = invites.filter((invite) => invite.event_id === event.id);
  const size = (rsvp: string) =>
    mine.filter((invite) => invite.rsvp === rsvp).reduce((sum, invite) => sum + (invite.party_size ?? 1), 0);
  const confirmed = size('yes');
  const pending = size('pending');
  if (mine.length === 0) {
    const expected = event.expected_guests ?? 0;
    return { count: expected, line: 'Nobody invited yet, so this uses the expected guests for the event' };
  }
  return {
    count: Math.ceil((confirmed + pending) * 1.1),
    line: `${confirmed} confirmed + ${pending} not answered, plus 10% extra`,
  };
}
