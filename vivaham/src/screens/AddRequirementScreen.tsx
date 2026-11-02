import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import { ChipGroup, EditableChips } from '../components/Chips';
import Field from '../components/Field';
import Screen from '../components/Screen';
import Stepper from '../components/Stepper';
import { ErrorText, Label, Note, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, fetchPeople, rows, run } from '../lib/data';
import { plural } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { useNav, useParams } from '../navigation/nav';
import { colors, fonts } from '../theme';
import { eventOption } from './RequirementsListScreen';

const CATEGORIES = ['Flowers', 'Pooja items', 'Decor', 'Return gifts'];
const UNITS = ['pieces', 'kg', 'metres', 'litres', 'packets', 'sets'];

export default function AddRequirementScreen() {
  const navigation = useNav();
  const params = useParams<{ eventId: string }>();
  const { wedding, access } = useWedding();
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [eventId, setEventId] = useState<string | null>(params.eventId ?? null);
  const [categories, setCategories] = useState(CATEGORIES);
  const [category, setCategory] = useState<string | null>(null);
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pieces');
  const [people, setPeople] = useState<string[]>([]);
  const [person, setPerson] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchEvents(),
      fetchPeople((module) => access(module) !== 'none'),
      rows<{ category: string | null }>(supabase.from('requirements').select('category')),
    ])
      .then(([eventRows, names, categoryRows]) => {
        setEvents(eventRows);
        setEventId((current) => current ?? eventRows[0]?.id ?? null);
        setPeople(names);
        const used = categoryRows.map((row) => row.category).filter(Boolean) as string[];
        setCategories((current) => [...new Set([...current, ...used])]);
      })
      .catch((loadError) => setError(errorText(loadError)));
  }, [access]);

  async function save() {
    if (!wedding) {
      return;
    }
    if (!eventId) {
      setError('Choose the event this is for.');
      return;
    }
    if (!item.trim()) {
      setError('Write the item, for example Marigold garlands.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await run(
        supabase.from('requirements').insert({
          wedding_id: wedding.id,
          event_id: eventId,
          category: category ?? 'Other',
          item: item.trim(),
          quantity,
          unit,
          assigned_to: person,
          status: done ? 'done' : 'needed',
        })
      );
      navigation.goBack();
    } catch (saveError) {
      setError(errorText(saveError));
      setSaving(false);
    }
  }

  const back = { label: 'Cancel', onPress: () => navigation.goBack() };

  if (access('requirements') !== 'edit') {
    return (
      <Screen back={back}>
        <Note>You can view requirements but not add them.</Note>
      </Screen>
    );
  }

  return (
    <Screen back={back} gap={22}>
      <Title>Add a requirement</Title>
      {events === null && !error ? <Note>Loading…</Note> : null}

      <View style={styles.group}>
        <Label>For which event?</Label>
        <ChipGroup
          columns={2}
          options={(events ?? []).map(eventOption)}
          selected={eventId ? [eventId] : []}
          onPress={setEventId}
        />
      </View>

      <View style={styles.group}>
        <Label>Category</Label>
        <EditableChips
          options={categories}
          onOptionsChange={setCategories}
          value={category}
          onChange={setCategory}
          placeholder="Add a new category, e.g. Lighting"
        />
      </View>

      <Field label="Item" placeholder="e.g. Marigold garlands" value={item} onChangeText={setItem} />

      <View style={styles.group}>
        <Label>How much?</Label>
        <Stepper wide name="quantity" value={quantity} min={1} onChange={setQuantity} label={`${quantity} ${unit}`} />
        <Text style={styles.small}>Unit</Text>
        <ChipGroup
          options={UNITS.map((option) => ({ key: option, label: option }))}
          selected={[unit]}
          onPress={setUnit}
        />
      </View>

      <View style={styles.group}>
        <Label right={<Text style={styles.count}>{plural(people.length, 'person', 'people')}</Text>}>
          Who arranges it?
        </Label>
        <EditableChips
          options={people}
          onOptionsChange={setPeople}
          value={person}
          onChange={setPerson}
          placeholder="Add a new name"
        />
      </View>

      <View style={styles.group}>
        <Label>Status</Label>
        <ChipGroup
          columns={2}
          options={[
            { key: 'needed', label: 'Needed' },
            { key: 'done', label: 'Arranged' },
          ]}
          selected={[done ? 'done' : 'needed']}
          onPress={(key) => setDone(key === 'done')}
        />
      </View>

      <ErrorText>{error}</ErrorText>
      <PrimaryButton label={saving ? 'Saving…' : 'Add requirement'} onPress={save} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 10 },
  small: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
  count: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
});
