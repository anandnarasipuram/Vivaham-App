import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import Calendar from '../components/Calendar';
import { ChipGroup } from '../components/Chips';
import Field, { Input } from '../components/Field';
import Icon from '../components/Icon';
import Screen from '../components/Screen';
import Stepper from '../components/Stepper';
import { ErrorText, Label, Lead, Note, Title } from '../components/ui';
import { errorText, one, rows, run } from '../lib/data';
import { dayDate, daysBetween, plural } from '../lib/format';
import { fetchGuestOptions, GuestOption } from '../lib/stays';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';

export default function AddStayScreen() {
  const navigation = useNav();
  const { wedding, access } = useWedding();
  const canSeeGuests = access('guests') !== 'none';
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState<GuestOption[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canSeeGuests) {
      setGuests([]);
      return;
    }
    Promise.all([
      fetchGuestOptions(),
      rows<{ guest_id: string }>(supabase.from('accommodation_guests').select('guest_id')),
    ])
      .then(([options, placed]) => {
        const placedIds = new Set(placed.map((row) => row.guest_id));
        setGuests(options.filter((guest) => !placedIds.has(guest.id)));
      })
      .catch((loadError) => setError(errorText(loadError)));
  }, [canSeeGuests]);

  async function save() {
    if (!wedding) {
      return;
    }
    if (!name.trim()) {
      setError('Write the name of the place.');
      return;
    }
    if (!start || !end) {
      setError('Tap the check-in date and then the check-out date.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const stay = await one<{ id: string }>(
        supabase
          .from('accommodations')
          .insert({
            wedding_id: wedding.id,
            name: name.trim(),
            address: address.trim() || null,
            maps_url: mapsUrl.trim() || null,
            rooms,
            checkin_date: start,
            checkout_date: end,
          })
          .select('id')
          .single()
      );
      if (picked.length > 0) {
        await run(
          supabase.from('accommodation_guests').insert(
            picked.map((guestId) => ({
              wedding_id: wedding.id,
              accommodation_id: stay.id,
              guest_id: guestId,
              people: guests?.find((guest) => guest.id === guestId)?.people ?? 1,
            }))
          )
        );
      }
      navigation.goBack();
    } catch (saveError) {
      setError(errorText(saveError));
      setSaving(false);
    }
  }

  const back = { label: 'Cancel', onPress: () => navigation.goBack() };

  if (access('stays') !== 'edit') {
    return (
      <Screen back={back}>
        <Note>You can view stays but not add them.</Note>
      </Screen>
    );
  }

  const rangeLabel = start
    ? end
      ? `${dayDate(start)} → ${dayDate(end)} · ${plural(daysBetween(start, end), 'night', 'nights')}`
      : `${dayDate(start)} → ?`
    : 'Pick dates';
  const rangeHint = !start
    ? 'Tap the check-in date first.'
    : !end
      ? 'Now tap the check-out date.'
      : 'Tap a date to start again.';
  const people = picked.reduce((sum, id) => sum + (guests?.find((guest) => guest.id === id)?.people ?? 1), 0);

  return (
    <Screen back={back} gap={22}>
      <View style={styles.head}>
        <Title>Add a stay</Title>
        <Lead>One stay = one place and its dates. Booking in several places? Add each one separately.</Lead>
      </View>
      <Field label="Place name" placeholder="e.g. Hotel near the venue" value={name} onChangeText={setName} />
      <View style={styles.group}>
        <Label>Location</Label>
        <Input accessibilityLabel="Address" placeholder="Full address" value={address} onChangeText={setAddress} />
        <View style={styles.mapRow}>
          <Icon name="pin" color={colors.maroon} size={20} />
          <TextInput
            accessibilityLabel="Google Maps link"
            placeholder="Paste Google Maps link (for sharing)"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            keyboardType="url"
            style={styles.mapInput}
            value={mapsUrl}
            onChangeText={setMapsUrl}
          />
        </View>
      </View>
      <View style={styles.group}>
        <Label right={rangeLabel}>Dates</Label>
        <Text style={styles.hint}>{rangeHint}</Text>
        <Calendar
          rangeStart={start}
          rangeEnd={end}
          initialMonth={wedding?.weddingDate}
          onRangeChange={(nextStart, nextEnd) => {
            setStart(nextStart);
            setEnd(nextEnd);
          }}
        />
      </View>
      <View style={styles.between}>
        <View style={styles.flex}>
          <Label>How many rooms?</Label>
          <Text style={styles.hint}>{people > 0 ? `For ${plural(people, 'person', 'people')} picked below` : 'Rooms booked at this place'}</Text>
        </View>
        <Stepper name="rooms" value={rooms} min={1} onChange={setRooms} />
      </View>
      <View style={styles.group}>
        <Label right={<Text style={styles.hint}>{`${picked.length} picked`}</Text>}>Who is staying here?</Label>
        <Text style={styles.hint}>Tap to choose everyone staying at this place.</Text>
        {!canSeeGuests ? <Note>You can add guests to this stay later from the Stays screen.</Note> : null}
        {guests === null && canSeeGuests ? <Note>Loading guests…</Note> : null}
        {guests && guests.length === 0 && canSeeGuests ? (
          <Note>Everyone on the guest list already has a place to stay. Add new guests in the Guests tab.</Note>
        ) : null}
        <ChipGroup
          check
          options={(guests ?? []).map((guest) => ({ key: guest.id, label: guest.name }))}
          selected={picked}
          onPress={(id) => setPicked(picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id])}
        />
      </View>
      <ErrorText>{error}</ErrorText>
      <PrimaryButton label={saving ? 'Saving…' : 'Save stay'} onPress={save} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: 6 },
  group: { gap: 8 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  flex: { flex: 1, gap: 2 },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  mapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    gap: 10,
  },
  mapInput: { flex: 1, height: 50, fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
});
