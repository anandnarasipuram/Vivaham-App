import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import { ChipGroup } from '../components/Chips';
import Field from '../components/Field';
import Screen from '../components/Screen';
import Stepper from '../components/Stepper';
import { ErrorText, Label, Note, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, one, run } from '../lib/data';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { useNav, useParams } from '../navigation/nav';

const SIDES = [
  { key: "Groom's side", label: 'Groom' },
  { key: "Bride's side", label: 'Bride' },
];

export default function AddGuestScreen() {
  const navigation = useNav();
  const params = useParams<{ eventId: string }>();
  const { wedding, access } = useWedding();
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [side, setSide] = useState(SIDES[0].key);
  const [invited, setInvited] = useState<string[]>(params.eventId ? [params.eventId] : []);
  const [people, setPeople] = useState(1);
  const [notes, setNotes] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch((loadError) => setError(errorText(loadError)));
  }, []);

  function toggle(eventId: string) {
    setInvited(invited.includes(eventId) ? invited.filter((id) => id !== eventId) : [...invited, eventId]);
  }

  async function save() {
    if (!wedding) {
      return;
    }
    if (!name.trim()) {
      setError('Write the person or family name.');
      return;
    }
    if (invited.length === 0) {
      setError('Choose at least one event to invite them to.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const guest = createdId ? { id: createdId } : await one<{ id: string }>(
        supabase
          .from('guests')
          .insert({
            wedding_id: wedding.id,
            name: name.trim(),
            phone: phone.trim() || null,
            side,
            notes: notes.trim() || null,
          })
          .select('id')
          .single()
      );
      setCreatedId(guest.id);
      await run(
        supabase.from('guest_events').insert(
          invited.map((eventId) => ({
            wedding_id: wedding.id,
            guest_id: guest.id,
            event_id: eventId,
            rsvp: 'pending',
            party_size: people,
          }))
        )
      );
      navigation.goBack();
    } catch (saveError) {
      setError(errorText(saveError));
      setSaving(false);
    }
  }

  const back = { label: 'Cancel', onPress: () => navigation.goBack() };

  if (access('guests') !== 'edit') {
    return (
      <Screen back={back}>
        <Note>You can view guests but not add them.</Note>
      </Screen>
    );
  }

  return (
    <Screen back={back} gap={22}>
      <Title>Add a guest</Title>
      <Field label="Name" placeholder="Person or family name" autoCapitalize="words" value={name} onChangeText={setName} />
      <Field label="Phone" placeholder="+91 98765 43210" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <View style={styles.group}>
        <Label>Which side?</Label>
        <ChipGroup columns={2} options={SIDES} selected={[side]} onPress={setSide} />
      </View>
      <View style={styles.group}>
        <Label>Invite to</Label>
        {events === null && !error ? <Note>Loading events…</Note> : null}
        {events && events.length === 0 ? <Note>Add an event first.</Note> : null}
        <ChipGroup
          columns={2}
          check
          options={(events ?? []).map((event) => ({ key: event.id, label: event.name }))}
          selected={invited}
          onPress={toggle}
        />
      </View>
      <View style={styles.between}>
        <Label>How many people?</Label>
        <Stepper name="people" value={people} min={1} onChange={setPeople} />
      </View>
      <Field
        label="Notes"
        hint="Optional"
        multiline
        placeholder="e.g. vegetarian, arriving a day early"
        value={notes}
        onChangeText={setNotes}
      />
      <ErrorText>{error}</ErrorText>
      <PrimaryButton label={saving ? 'Saving…' : 'Save guest'} onPress={save} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
