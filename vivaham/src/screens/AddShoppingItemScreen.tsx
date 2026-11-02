import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import { ChipGroup, EditableChips } from '../components/Chips';
import Field, { MoneyField } from '../components/Field';
import Screen from '../components/Screen';
import { ErrorText, Label, Note, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, fetchPeople, run } from '../lib/data';
import { parseAmount, plural } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { useNav, useParams } from '../navigation/nav';
import { colors, fonts } from '../theme';

export default function AddShoppingItemScreen() {
  const navigation = useNav();
  const params = useParams<{ eventId: string }>();
  const { wedding, access } = useWedding();
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [item, setItem] = useState('');
  const [eventId, setEventId] = useState<string | null>(params.eventId ?? null);
  const [people, setPeople] = useState<string[]>([]);
  const [person, setPerson] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [bought, setBought] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchEvents(), fetchPeople((module) => access(module) !== 'none')])
      .then(([eventRows, names]) => {
        setEvents(eventRows);
        setEventId((current) => current ?? eventRows[0]?.id ?? null);
        setPeople(names);
      })
      .catch((loadError) => setError(errorText(loadError)));
  }, [access]);

  async function save() {
    if (!wedding) {
      return;
    }
    if (!item.trim()) {
      setError('Write what to buy.');
      return;
    }
    if (!eventId) {
      setError('Choose the event this is for.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await run(
        supabase.from('shopping_items').insert({
          wedding_id: wedding.id,
          event_id: eventId,
          person,
          item: item.trim(),
          price: parseAmount(price),
          status: bought ? 'bought' : 'to buy',
        })
      );
      navigation.goBack();
    } catch (saveError) {
      setError(errorText(saveError));
      setSaving(false);
    }
  }

  const back = { label: 'Cancel', onPress: () => navigation.goBack() };

  if (access('shopping') !== 'edit') {
    return (
      <Screen back={back}>
        <Note>You can view the shopping list but not add to it.</Note>
      </Screen>
    );
  }

  return (
    <Screen back={back} gap={22}>
      <Title>Add a shopping item</Title>
      <Field label="What to buy?" placeholder="e.g. Silk saree, veshti, sherwani" value={item} onChangeText={setItem} />
      <View style={styles.group}>
        <Label>For which event?</Label>
        {events === null && !error ? <Note>Loading events…</Note> : null}
        {events && events.length === 0 ? <Note>Add an event first.</Note> : null}
        <ChipGroup
          columns={2}
          options={(events ?? []).map((event) => ({ key: event.id, label: event.name }))}
          selected={eventId ? [eventId] : []}
          onPress={setEventId}
        />
      </View>
      <View style={styles.group}>
        <Label right={<Text style={styles.count}>{plural(people.length, 'person', 'people')}</Text>}>Who is it for?</Label>
        <EditableChips
          options={people}
          onOptionsChange={setPeople}
          value={person}
          onChange={setPerson}
          placeholder="Add a new name, e.g. Amma"
        />
      </View>
      <MoneyField label="Price" value={price} onChangeText={setPrice} />
      <View style={styles.group}>
        <Label>Status</Label>
        <ChipGroup
          columns={2}
          options={[
            { key: 'to buy', label: 'To buy' },
            { key: 'bought', label: 'Already bought' },
          ]}
          selected={[bought ? 'bought' : 'to buy']}
          onPress={(key) => setBought(key === 'bought')}
        />
      </View>
      <ErrorText>{error}</ErrorText>
      <PrimaryButton label={saving ? 'Saving…' : 'Add item'} onPress={save} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  count: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
});
