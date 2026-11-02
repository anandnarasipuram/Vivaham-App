import { useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import BackPill from '../components/BackPill';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { ChipGroup } from '../components/Chips';
import { Input } from '../components/Field';
import TopStrip from '../components/TopStrip';
import { Avatar, EmptyBox, ErrorText, Note, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, rows, run, useFocusData } from '../lib/data';
import { initial, plural } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { goHome, useNav, useParams } from '../navigation/nav';
import { colors, fonts } from '../theme';
import { eventOption } from './RequirementsListScreen';

type Guest = { id: string; name: string; phone: string | null; side: string | null; notes: string | null };
type Invite = { guest_id: string; event_id: string; rsvp: string; party_size: number | null };
type Row = Guest & { rsvp: string; size: number };

const RSVP = [
  { key: 'yes', label: 'Coming', on: { backgroundColor: colors.tintGreen, borderColor: colors.green }, color: colors.green },
  { key: 'pending', label: 'Pending', on: { backgroundColor: colors.tintGold, borderColor: colors.goldInk }, color: colors.goldInk },
  { key: 'no', label: 'Not coming', on: { backgroundColor: colors.tintRose, borderColor: colors.maroon }, color: colors.maroon },
];

export default function GuestsListScreen() {
  const navigation = useNav();
  const params = useParams<{ eventId: string }>();
  const { access } = useWedding();
  const canSee = access('guests') !== 'none';
  const canEdit = access('guests') === 'edit';
  const [eventId, setEventId] = useState<string | null>(params.eventId ?? null);
  const [search, setSearch] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    if (params.eventId) {
      setEventId(params.eventId);
    }
  }, [params.eventId]);

  const { data, error, reload } = useFocusData(async () => {
    if (!canSee) {
      return { events: [] as EventRow[], guests: [] as Guest[], invites: [] as Invite[] };
    }
    const [events, guests, invites] = await Promise.all([
      fetchEvents(),
      rows<Guest>(supabase.from('guests').select('id, name, phone, side, notes').order('name')),
      rows<Invite>(supabase.from('guest_events').select('guest_id, event_id, rsvp, party_size')),
    ]);
    setOverrides({});
    return { events, guests, invites };
  }, [canSee]);

  const events = data?.events ?? [];
  const selected = events.find((event) => event.id === eventId) ?? events[0];

  const list = useMemo(() => {
    if (!data || !selected) {
      return [] as Row[];
    }
    const byId = new Map(data.guests.map((guest) => [guest.id, guest]));
    return data.invites
      .filter((invite) => invite.event_id === selected.id && byId.has(invite.guest_id))
      .map((invite) => ({
        ...(byId.get(invite.guest_id) as Guest),
        rsvp: overrides[invite.guest_id] ?? invite.rsvp,
        size: invite.party_size ?? 1,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, selected, overrides]);

  const total = (rsvp?: string) =>
    list.filter((row) => !rsvp || row.rsvp === rsvp).reduce((sum, row) => sum + row.size, 0);
  const query = search.trim().toLowerCase();
  const shown = query ? list.filter((row) => row.name.toLowerCase().includes(query)) : list;

  async function setRsvp(row: Row, rsvp: string) {
    if (!selected || row.rsvp === rsvp) {
      return;
    }
    setUpdateError('');
    setOverrides((current) => ({ ...current, [row.id]: rsvp }));
    try {
      await run(
        supabase.from('guest_events').update({ rsvp }).eq('guest_id', row.id).eq('event_id', selected.id)
      );
      await reload();
    } catch (saveError) {
      setUpdateError(errorText(saveError));
      setOverrides((current) => ({ ...current, [row.id]: row.rsvp }));
    }
  }

  const header = (
    <View style={styles.header}>
      <BackPill label="Home" onPress={() => goHome(navigation)} />
      <View style={styles.titleRow}>
        <Title>Guests</Title>
        {canSee ? (
          <PrimaryButton
            size="small"
            color={colors.whatsapp}
            label="Send messages"
            onPress={() => navigation.navigate('SendMessages')}
          />
        ) : null}
      </View>
      {!canSee ? <Note>You don’t have access to Guests.</Note> : null}
      <ErrorText>{error || updateError}</ErrorText>
      {canSee && !data && !error ? <Note>Loading guests…</Note> : null}
      {data && events.length === 0 ? <EmptyBox>Add an event first, then invite guests to it.</EmptyBox> : null}
      {selected ? (
        <View style={styles.section}>
          <Text style={styles.h2}>RSVPs by event</Text>
          <ChipGroup columns={2} options={events.map(eventOption)} selected={[selected.id]} onPress={setEventId} />
          <View style={styles.stats}>
            <Stat label="Invited" value={total()} />
            <Stat label="Confirmed" value={total('yes')} tone="green" />
            <Stat label="Pending" value={total('pending')} tone="gold" />
          </View>
          {list.length > 0 ? (
            <Input
              accessibilityLabel="Search guests"
              placeholder="Search guests by name"
              autoCapitalize="none"
              value={search}
              onChangeText={setSearch}
            />
          ) : null}
          {list.length === 0 ? <EmptyBox>{`No guests invited to ${selected.name} yet.`}</EmptyBox> : null}
          {list.length > 0 && shown.length === 0 ? <Note>No guest matches your search.</Note> : null}
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      <TopStrip />
      <FlatList
        data={shown}
        keyExtractor={(row) => row.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Avatar label={initial(item.name)} size={44} tone="rose" />
              <View style={styles.flex}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {[item.side, plural(item.size, 'person', 'people')].filter(Boolean).join(' · ')}
                </Text>
              </View>
            </View>
            <View style={styles.rsvps} accessibilityLabel={`RSVP for ${item.name}`}>
              {RSVP.map((option) => {
                const on = item.rsvp === option.key;
                return (
                  <Pressable
                    key={option.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on, disabled: !canEdit }}
                    disabled={!canEdit}
                    style={[styles.rsvp, on && [styles.rsvpOn, option.on]]}
                    onPress={() => setRsvp(item, option.key)}
                  >
                    <Text style={[styles.rsvpText, on && { color: option.color, fontFamily: fonts.bold }]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
        ListFooterComponent={
          canEdit && events.length > 0 ? (
            <View style={styles.footer}>
              <PrimaryButton
                size="medium"
                label="+ Add a guest"
                onPress={() => navigation.navigate('AddGuest', { eventId: selected?.id })}
              />
              {Platform.OS === 'web' ? (
                <Note>Contact import works in the phone app. Add guests manually or paste a list.</Note>
              ) : (
                <SecondaryButton label="Import from contacts" onPress={() => navigation.navigate('ImportContacts')} />
              )}
            </View>
          ) : undefined
        }
      />
    </View>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'green' | 'gold' }) {
  const palette =
    tone === 'green'
      ? { box: { backgroundColor: colors.tintGreen, borderColor: colors.greenBorder }, color: colors.green }
      : tone === 'gold'
        ? { box: { backgroundColor: colors.tintGold, borderColor: colors.goldBorder }, color: colors.goldInk }
        : { box: { backgroundColor: colors.white, borderColor: colors.tileBorder }, color: colors.ink };
  return (
    <View style={[styles.stat, palette.box]}>
      <Text style={[styles.statLabel, { color: tone ? palette.color : colors.muted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: palette.color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingTop: 12, paddingHorizontal: 20, paddingBottom: 32 },
  header: { gap: 18, marginBottom: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  section: { gap: 12 },
  h2: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 12, gap: 2 },
  statLabel: { fontFamily: fonts.semibold, fontSize: 13 },
  statValue: { fontFamily: fonts.extrabold, fontSize: 26 },
  gap: { height: 12 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
  rsvps: { flexDirection: 'row', gap: 6 },
  rsvp: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  rsvpOn: { borderWidth: 2 },
  rsvpText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink, textAlign: 'center' },
  footer: { marginTop: 18, gap: 10 },
});
