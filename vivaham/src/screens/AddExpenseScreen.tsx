import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import { ChipGroup, EditableChips } from '../components/Chips';
import Field, { MoneyField } from '../components/Field';
import Screen from '../components/Screen';
import { ErrorText, Label, Note, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, fetchPeople, rows, run } from '../lib/data';
import { parseAmount, plural } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';

const CATEGORIES = ['Venue', 'Catering', 'Decor', 'Photography', 'Music'];
const WHOLE = 'whole';

export default function AddExpenseScreen() {
  const navigation = useNav();
  const { wedding, access } = useWedding();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState(CATEGORIES);
  const [category, setCategory] = useState<string | null>(null);
  const [eventId, setEventId] = useState(WHOLE);
  const [amount, setAmount] = useState('');
  const [paid, setPaid] = useState('');
  const [people, setPeople] = useState<string[]>([]);
  const [paidBy, setPaidBy] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchEvents(),
      fetchPeople((module) => access(module) !== 'none'),
      rows<{ category: string | null }>(supabase.from('expenses').select('category')),
    ])
      .then(([eventRows, names, categoryRows]) => {
        setEvents(eventRows);
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
    const total = parseAmount(amount);
    const paidSoFar = parseAmount(paid);
    if (!description.trim()) {
      setError('Write what the expense is for.');
      return;
    }
    if (total <= 0) {
      setError('Enter the total amount.');
      return;
    }
    if (paidSoFar > total) {
      setError('Paid so far cannot be more than the total amount.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await run(
        supabase.from('expenses').insert({
          wedding_id: wedding.id,
          event_id: eventId === WHOLE ? null : eventId,
          description: description.trim(),
          category: category ?? 'Other',
          amount: total,
          paid: paidSoFar,
          paid_by: paidBy,
        })
      );
      navigation.goBack();
    } catch (saveError) {
      setError(errorText(saveError));
      setSaving(false);
    }
  }

  const back = { label: 'Cancel', onPress: () => navigation.goBack() };

  if (access('budget') !== 'edit') {
    return (
      <Screen back={back}>
        <Note>You can view the budget but not add expenses.</Note>
      </Screen>
    );
  }

  return (
    <Screen back={back} gap={22}>
      <Title>Add an expense</Title>
      <Field label="What is it for?" placeholder="e.g. Wedding hall booking" value={description} onChangeText={setDescription} />
      <View style={styles.group}>
        <Label>Category</Label>
        <EditableChips
          options={categories}
          onOptionsChange={setCategories}
          value={category}
          onChange={setCategory}
          placeholder="Add a new category, e.g. Transport"
        />
      </View>
      <View style={styles.group}>
        <Label>For which event?</Label>
        <ChipGroup
          options={[{ key: WHOLE, label: 'Whole wedding' }, ...events.map((event) => ({ key: event.id, label: event.name }))]}
          selected={[eventId]}
          onPress={setEventId}
        />
      </View>
      <View style={styles.amounts}>
        <MoneyField label="Total amount" value={amount} onChangeText={setAmount} />
        <MoneyField label="Paid so far" value={paid} onChangeText={setPaid} />
      </View>
      <View style={styles.group}>
        <Label right={<Text style={styles.count}>{plural(people.length, 'person', 'people')}</Text>}>Paid by</Label>
        <EditableChips
          options={people}
          onOptionsChange={setPeople}
          value={paidBy}
          onChange={setPaidBy}
          placeholder="Add a new name, e.g. Nanna"
        />
      </View>
      <ErrorText>{error}</ErrorText>
      <PrimaryButton label={saving ? 'Saving…' : 'Save expense'} onPress={save} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 10 },
  amounts: { flexDirection: 'row', gap: 12 },
  count: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
});
