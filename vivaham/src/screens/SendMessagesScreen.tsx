import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import BackPill from '../components/BackPill';
import { Chip, ChipGroup } from '../components/Chips';
import { Input } from '../components/Field';
import Icon from '../components/Icon';
import SelectRow from '../components/SelectRow';
import TickBox from '../components/TickBox';
import TopStrip from '../components/TopStrip';
import { EmptyBox, ErrorText, Note, ProgressBar, Segmented, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, rows, run, useFocusData } from '../lib/data';
import { fullDate, shortDate, timeLabel } from '../lib/format';
import {
  fill,
  INVITATION_MESSAGE,
  openWhatsApp,
  STAY_MESSAGE,
  TRANSPORT_MESSAGE,
  Vehicle,
  vehicleLines,
} from '../lib/messages';
import { mapsLink, stayWhen } from '../lib/stays';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';
import { fetchVehicles } from './TransportScreen';

type Guest = { id: string; name: string; phone: string | null };
type Invite = { guest_id: string; event_id: string; rsvp: string };
type Stay = {
  id: string;
  name: string;
  address: string | null;
  maps_url: string | null;
  checkin_date: string | null;
  checkin_time: string | null;
  checkout_date: string | null;
  checkout_time: string | null;
  contact_name: string | null;
  contact_phone: string | null;
};
type Placement = { guest_id: string; accommodation_id: string };
type Row = { guest: Guest; kind: string; message: string };

const RSVP_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'yes', label: 'Coming' },
  { key: 'no', label: 'Not coming' },
];

export default function SendMessagesScreen() {
  const navigation = useNav();
  const { wedding, access } = useWedding();
  const canSee = access('guests') !== 'none';
  const canMark = access('guests') === 'edit';
  const canStays = access('stays') !== 'none';
  const canTransport = access('transport') !== 'none';
  const [tab, setTab] = useState('invite');
  const [eventId, setEventId] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState('all');
  const [stayId, setStayId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [onlyUnsent, setOnlyUnsent] = useState(false);
  const [sent, setSent] = useState<Set<string> | null>(null);
  const [actionError, setActionError] = useState('');

  const { data, error } = useFocusData(async () => {
    const empty = Promise.resolve([]);
    const [events, guests, invites, stays, placements, vehicles, log] = await Promise.all([
      fetchEvents(),
      rows<Guest>(supabase.from('guests').select('id, name, phone').order('name')),
      rows<Invite>(supabase.from('guest_events').select('guest_id, event_id, rsvp')),
      canStays
        ? rows<Stay>(
            supabase
              .from('accommodations')
              .select(
                'id, name, address, maps_url, checkin_date, checkin_time, checkout_date, checkout_time, contact_name, contact_phone'
              )
              .order('checkin_date')
          )
        : (empty as Promise<Stay[]>),
      canStays
        ? rows<Placement>(supabase.from('accommodation_guests').select('guest_id, accommodation_id'))
        : (empty as Promise<Placement[]>),
      canTransport ? fetchVehicles() : (empty as Promise<Vehicle[]>),
      rows<{ guest_id: string; kind: string }>(supabase.from('share_log').select('guest_id, kind')),
    ]);
    setSent(new Set(log.map((row) => `${row.guest_id}|${row.kind}`)));
    return { events, guests, invites, stays, placements, vehicles };
  }, [canStays, canTransport]);

  const event: EventRow | undefined = data?.events.find((row) => row.id === eventId) ?? data?.events[0];
  const stay = data?.stays.find((row) => row.id === stayId) ?? data?.stays[0];

  const all = useMemo<Row[]>(() => {
    if (!data) {
      return [];
    }
    const byId = new Map(data.guests.map((guest) => [guest.id, guest]));
    if (tab === 'invite') {
      if (!event) {
        return [];
      }
      return data.invites
        .filter((invite) => invite.event_id === event.id && (rsvp === 'all' || invite.rsvp === rsvp))
        .map((invite) => byId.get(invite.guest_id))
        .filter((guest): guest is Guest => Boolean(guest))
        .map((guest) => ({
          guest,
          kind: `invite:${event.id}`,
          message: fill(INVITATION_MESSAGE, {
            name: guest.name,
            event: event.name,
            date: fullDate(event.event_date),
            time: event.start_time ? `at ${timeLabel(event.start_time)}` : '',
            dress: event.dress_code ? `Dress code: ${event.dress_code}` : '',
            details: event.notes,
          }),
        }));
    }
    if (tab === 'stay') {
      if (!stay) {
        return [];
      }
      return data.placements
        .filter((placement) => placement.accommodation_id === stay.id)
        .map((placement) => byId.get(placement.guest_id))
        .filter((guest): guest is Guest => Boolean(guest))
        .map((guest) => ({
          guest,
          kind: 'stay',
          message: fill(STAY_MESSAGE, {
            name: guest.name,
            place: stay.name,
            map: mapsLink(stay.maps_url, stay.address, stay.name),
            address: stay.address,
            checkin: stayWhen(stay.checkin_date, stay.checkin_time),
            checkout: stayWhen(stay.checkout_date, stay.checkout_time),
            contact: [stay.contact_name, stay.contact_phone].filter(Boolean).join(' '),
          }),
        }));
    }
    const placed = new Set(data.placements.map((placement) => placement.guest_id));
    const vehicles = vehicleLines(data.vehicles);
    return data.guests
      .filter((guest) => placed.has(guest.id))
      .map((guest) => ({
        guest,
        kind: 'transport',
        message: fill(TRANSPORT_MESSAGE, { name: guest.name, vehicles }),
      }));
  }, [data, tab, event, stay, rsvp]);

  const isSent = (row: Row) => sent?.has(`${row.guest.id}|${row.kind}`) ?? false;
  const sentCount = all.filter(isSent).length;
  const query = search.trim().toLowerCase();
  const shown = all.filter(
    (row) => (!query || row.guest.name.toLowerCase().includes(query)) && (!onlyUnsent || !isSent(row))
  );

  async function mark(row: Row, value: boolean) {
    if (!wedding || !sent || !canMark) {
      return;
    }
    const key = `${row.guest.id}|${row.kind}`;
    const next = new Set(sent);
    if (value) {
      next.add(key);
    } else {
      next.delete(key);
    }
    setSent(next);
    setActionError('');
    try {
      if (value) {
        await run(
          supabase
            .from('share_log')
            .upsert(
              { wedding_id: wedding.id, guest_id: row.guest.id, kind: row.kind },
              { onConflict: 'guest_id,kind', ignoreDuplicates: true }
            )
        );
      } else {
        await run(supabase.from('share_log').delete().eq('guest_id', row.guest.id).eq('kind', row.kind));
      }
    } catch (failure) {
      setActionError(errorText(failure));
      setSent(sent);
    }
  }

  async function send(row: Row) {
    setActionError('');
    try {
      await openWhatsApp(row.message, row.guest.phone);
      if (!isSent(row)) {
        await mark(row, true);
      }
    } catch (failure) {
      setActionError(`Could not open WhatsApp: ${errorText(failure)}`);
    }
  }

  const tabs = [
    { key: 'invite', label: 'Invitations' },
    ...(canStays ? [{ key: 'stay', label: 'Stay' }] : []),
    ...(canStays && canTransport ? [{ key: 'transport', label: 'Transport' }] : []),
  ];

  const header = (
    <View style={styles.header}>
      <BackPill label="Guests" onPress={() => navigation.goBack()} />
      <Title>Send messages</Title>
      {!canSee ? <Note>You don’t have access to Guests.</Note> : null}
      <Segmented options={tabs} value={tab} onChange={setTab} />
      <ErrorText>{error || actionError}</ErrorText>
      {!data && !error ? <Note>Loading guests…</Note> : null}

      {data && tab === 'invite' ? (
        event ? (
          <>
            <SelectRow
              title="Invitation for"
              options={data.events.map((row) => ({ key: row.id, label: `${row.name} · ${shortDate(row.event_date)}` }))}
              value={event.id}
              onChange={setEventId}
            />
            <ChipGroup options={RSVP_FILTERS} selected={[rsvp]} onPress={setRsvp} />
          </>
        ) : (
          <EmptyBox>Add an event first.</EmptyBox>
        )
      ) : null}
      {data && tab === 'stay' ? (
        stay ? (
          <SelectRow
            title="Stay details for"
            options={data.stays.map((row) => ({ key: row.id, label: row.name }))}
            value={stay.id}
            onChange={setStayId}
          />
        ) : (
          <EmptyBox>Add a stay first in Stays.</EmptyBox>
        )
      ) : null}
      {data && tab === 'transport' && data.vehicles.length === 0 ? (
        <EmptyBox>Add vehicles in Transport first, so the message has something to list.</EmptyBox>
      ) : null}

      {all.length > 0 ? (
        <>
          <View style={styles.progress}>
            <Text style={styles.progressText}>{`${sentCount} of ${all.length} sent`}</Text>
            <ProgressBar ratio={sentCount / all.length} color={colors.green} />
          </View>
          <Input
            accessibilityLabel="Search guests"
            placeholder="Search by name"
            autoCapitalize="none"
            value={search}
            onChangeText={setSearch}
          />
          <View style={styles.toggle}>
            <Chip label="Only not sent yet" selected={onlyUnsent} onPress={() => setOnlyUnsent(!onlyUnsent)} />
          </View>
        </>
      ) : null}
      {data && all.length === 0 && (tab !== 'invite' || event) && (tab !== 'stay' || stay) ? (
        <EmptyBox>
          {tab === 'invite'
            ? 'No guests match this event and filter.'
            : tab === 'stay'
              ? 'Nobody is placed in this stay yet.'
              : 'Nobody is placed in a stay yet. Transport messages go to guests who have a stay.'}
        </EmptyBox>
      ) : null}
      {all.length > 0 && shown.length === 0 ? <Note>Nobody matches. Everyone may already be sent.</Note> : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      <TopStrip />
      <FlatList
        data={canSee ? shown : []}
        keyExtractor={(row) => `${row.guest.id}|${row.kind}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        initialNumToRender={20}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.name}>{item.guest.name}</Text>
              <Text style={[styles.small, !item.guest.phone && styles.noPhone]}>{item.guest.phone || 'no phone'}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Send WhatsApp to ${item.guest.name}`}
              disabled={!item.guest.phone}
              style={[styles.whatsapp, !item.guest.phone && styles.disabled]}
              onPress={() => send(item)}
            >
              <Icon name="chat" color={colors.white} size={16} />
              <Text style={styles.whatsappText}>WhatsApp</Text>
            </Pressable>
            <View style={styles.sent}>
              <TickBox
                checked={isSent(item)}
                label={`${item.guest.name}: ${isSent(item) ? 'sent' : 'not sent'}`}
                disabled={!canMark}
                onPress={() => mark(item, !isSent(item))}
              />
              <Text style={styles.sentLabel}>Sent</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingTop: 12, paddingHorizontal: 20, paddingBottom: 32 },
  header: { gap: 16, marginBottom: 12 },
  progress: { gap: 8 },
  progressText: { fontFamily: fonts.medium, fontSize: 15, color: colors.brownInk },
  toggle: { flexDirection: 'row' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 64,
    paddingLeft: 16,
    paddingRight: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    borderRadius: 14,
    marginBottom: 8,
  },
  flex: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  small: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  noPhone: { color: colors.maroon },
  whatsapp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: colors.whatsapp,
  },
  disabled: { opacity: 0.4 },
  whatsappText: { fontFamily: fonts.bold, fontSize: 14, color: colors.white },
  sent: { alignItems: 'center', marginLeft: 4 },
  sentLabel: { fontFamily: fonts.semibold, fontSize: 11, color: colors.muted, marginTop: -8 },
});
