import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Contact, ContactField, requestPermissionsAsync } from 'expo-contacts';
import BackPill from '../components/BackPill';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { ChipGroup } from '../components/Chips';
import { Input } from '../components/Field';
import Stepper from '../components/Stepper';
import TickBox from '../components/TickBox';
import TopStrip from '../components/TopStrip';
import { Badge, ErrorText, Label, Lead, Note, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, rows, run } from '../lib/data';
import { plural } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';

type Person = { key: string; name: string; phone: string; existing: boolean };

const FIELDS = [ContactField.FULL_NAME, ContactField.PHONES] as const;
const BATCH = 200;
const SIDES = [
  { key: "Groom's side", label: 'Groom' },
  { key: "Bride's side", label: 'Bride' },
];

function last10(phone: string | null | undefined) {
  return (phone ?? '').replace(/\D/g, '').slice(-10);
}

export default function ImportContactsScreen() {
  const navigation = useNav();
  const { wedding, access } = useWedding();
  const [people, setPeople] = useState<Person[] | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [side, setSide] = useState(SIDES[0].key);
  const [size, setSize] = useState(1);
  const [importing, setImporting] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const permission = await requestPermissionsAsync();
      if (!permission.granted) {
        setError('Vivaham needs access to your contacts to import them. You can allow it in your phone settings.');
        setPeople([]);
        return;
      }
      const [contacts, guests, eventRows] = await Promise.all([
        Contact.getAllDetails(FIELDS),
        rows<{ name: string; phone: string | null }>(supabase.from('guests').select('name, phone')),
        fetchEvents(),
      ]);
      const names = new Set(guests.map((guest) => guest.name.trim().toLowerCase()));
      const phones = new Set(guests.map((guest) => last10(guest.phone)).filter((digits) => digits.length >= 7));
      const seen = new Set<string>();
      const list: Person[] = [];
      contacts.forEach((contact, index) => {
        const name = (contact.fullName ?? '').trim();
        const phone = (contact.phones ?? []).find((item) => item.number)?.number?.trim() ?? '';
        const duplicate = `${name.toLowerCase()}|${last10(phone)}`;
        if (!name || seen.has(duplicate)) {
          return;
        }
        seen.add(duplicate);
        list.push({
          key: `${contact.id ?? 'contact'}#${index}`,
          name,
          phone,
          existing: names.has(name.toLowerCase()) || (last10(phone).length >= 7 && phones.has(last10(phone))),
        });
      });
      list.sort((a, b) => a.name.localeCompare(b.name));
      setPeople(list);
      setEvents(eventRows);
    }
    load().catch((loadError) => {
      setError(errorText(loadError));
      setPeople([]);
    });
  }, []);

  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (people ?? []).filter(
      (person) => !query || person.name.toLowerCase().includes(query) || person.phone.includes(query)
    );
  }, [people, search]);
  const fresh = (people ?? []).filter((person) => !person.existing);
  const allFreshTicked = fresh.length > 0 && fresh.every((person) => ticked.has(person.key));

  function toggle(key: string) {
    setTicked((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  async function importGuests() {
    if (!wedding || !people) {
      return;
    }
    const chosen = people.filter((person) => ticked.has(person.key));
    if (chosen.length === 0) {
      setError('Tick at least one person to import.');
      return;
    }
    if (eventIds.length === 0) {
      setError('Choose at least one event to invite them to.');
      return;
    }
    setError('');
    setResult('');
    let added = 0;
    try {
      for (let start = 0; start < chosen.length; start += BATCH) {
        setImporting(`Importing ${Math.min(start + BATCH, chosen.length)} of ${chosen.length}…`);
        const batch = chosen.slice(start, start + BATCH);
        const inserted = await rows<{ id: string }>(
          supabase
            .from('guests')
            .insert(
              batch.map((person) => ({
                wedding_id: wedding.id,
                name: person.name,
                phone: person.phone || null,
                side,
              }))
            )
            .select('id')
        );
        await run(
          supabase.from('guest_events').insert(
            inserted.flatMap((guest) =>
              eventIds.map((eventId) => ({
                wedding_id: wedding.id,
                guest_id: guest.id,
                event_id: eventId,
                rsvp: 'pending',
                party_size: size,
              }))
            )
          )
        );
        added += inserted.length;
      }
      setResult(`Added ${plural(added, 'guest', 'guests')}.`);
    } catch (importError) {
      setError(`${added > 0 ? `Added ${plural(added, 'guest', 'guests')}, then: ` : ''}${errorText(importError)}`);
    }
    const done = new Set(chosen.slice(0, added).map((person) => person.key));
    setPeople(people.map((person) => (done.has(person.key) ? { ...person, existing: true } : person)));
    setTicked(new Set([...ticked].filter((key) => !done.has(key))));
    setImporting('');
  }

  if (access('guests') !== 'edit') {
    return (
      <View style={styles.screen}>
        <TopStrip />
        <View style={styles.content}>
          <BackPill label="Guests" onPress={() => navigation.goBack()} />
          <Note>You can view guests but not add them.</Note>
        </View>
      </View>
    );
  }

  const header = (
    <View style={styles.header}>
      <BackPill label="Guests" onPress={() => navigation.goBack()} />
      <View style={styles.head}>
        <Title>Import from contacts</Title>
        <Lead>Tick the people to add. People already on your guest list are marked and left unticked.</Lead>
      </View>
      <ErrorText>{error}</ErrorText>
      {result ? <Text style={styles.result}>{result}</Text> : null}
      {people === null && !error ? <Note>Reading your contacts…</Note> : null}
      {people && people.length > 0 ? (
        <>
          <View style={styles.group}>
            <Label>Invite them to</Label>
            {events.length === 0 ? <Note>Add an event first.</Note> : null}
            <ChipGroup
              check
              options={events.map((event) => ({ key: event.id, label: event.name }))}
              selected={eventIds}
              onPress={(id) => setEventIds(eventIds.includes(id) ? eventIds.filter((item) => item !== id) : [...eventIds, id])}
            />
          </View>
          <View style={styles.group}>
            <Label>Which side?</Label>
            <ChipGroup columns={2} options={SIDES} selected={[side]} onPress={setSide} />
          </View>
          <View style={styles.between}>
            <Label>People per guest</Label>
            <Stepper name="people per guest" value={size} min={1} onChange={setSize} />
          </View>
          <Input
            accessibilityLabel="Search contacts"
            placeholder="Search by name or number"
            autoCapitalize="none"
            value={search}
            onChangeText={setSearch}
          />
          <Text style={styles.selected}>{`${ticked.size} selected`}</Text>
          <View style={styles.between}>
            <Text style={styles.small}>{`${plural(people.length, 'contact', 'contacts')} · ${fresh.length} new`}</Text>
            <Pressable
              accessibilityRole="button"
              style={styles.selectAll}
              onPress={() => setTicked(allFreshTicked ? new Set() : new Set(fresh.map((person) => person.key)))}
            >
              <Text style={styles.selectAllText}>{allFreshTicked ? 'Clear selection' : 'Select all new'}</Text>
            </Pressable>
          </View>
        </>
      ) : null}
      {people && people.length === 0 && !error ? <Note>No contacts with a name were found on this phone.</Note> : null}
      {people && people.length > 0 && shown.length === 0 ? <Note>Nobody matches your search.</Note> : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      <TopStrip />
      <FlatList
        data={shown}
        keyExtractor={(person) => person.key}
        extraData={ticked}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        initialNumToRender={30}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: ticked.has(item.key) }}
            style={[styles.row, ticked.has(item.key) && styles.rowOn]}
            onPress={() => toggle(item.key)}
          >
            <TickBox checked={ticked.has(item.key)} label={`Import ${item.name}`} onPress={() => toggle(item.key)} />
            <View style={styles.flex}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.small}>{item.phone || 'no phone'}</Text>
            </View>
            {item.existing ? <Badge tone="green" label="Already a guest" /> : null}
          </Pressable>
        )}
      />
      {people && people.length > 0 ? (
        <View style={styles.bar}>
          {importing ? <Text style={styles.importing}>{importing}</Text> : null}
          <PrimaryButton
            size="medium"
            label={importing ? 'Importing…' : `Import ${plural(ticked.size, 'guest', 'guests')}`}
            onPress={importGuests}
            disabled={Boolean(importing) || ticked.size === 0}
          />
          {result ? <SecondaryButton label="Back to guests" onPress={() => navigation.goBack()} /> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingTop: 12, paddingHorizontal: 20, paddingBottom: 24 },
  header: { gap: 18, marginBottom: 12 },
  head: { gap: 6 },
  group: { gap: 8 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  small: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  selectAll: { minHeight: 44, justifyContent: 'center' },
  selectAllText: { fontFamily: fonts.bold, fontSize: 15, color: colors.maroon },
  selected: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.maroon },
  rowOn: { borderColor: colors.green, backgroundColor: colors.tintGreen },
  result: { fontFamily: fonts.bold, fontSize: 15, color: colors.green },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 60,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    borderRadius: 14,
    marginBottom: 8,
  },
  flex: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  bar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 8,
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: colors.tileBorder,
  },
  importing: { fontFamily: fonts.semibold, fontSize: 14, color: colors.maroon, textAlign: 'center' },
});
