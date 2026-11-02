import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AddButton, PrimaryButton } from '../components/Buttons';
import { Chip, EditableChips } from '../components/Chips';
import Field, { Input } from '../components/Field';
import Screen from '../components/Screen';
import Stepper from '../components/Stepper';
import TimePicker from '../components/TimePicker';
import { ErrorText, Label, Lead, Note, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, one, run } from '../lib/data';
import { dayDate, timeLabel } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { useNav, useParams } from '../navigation/nav';
import { colors, fonts } from '../theme';

const MEAL_TIMES: Record<string, string> = {
  Breakfast: '08:30:00',
  Lunch: '13:00:00',
  Snacks: '16:30:00',
  Dinner: '20:00:00',
};

export default function AddMealScreen() {
  const navigation = useNav();
  const params = useParams<{ eventId: string; plan: number }>();
  const plan = Number(params.plan ?? 0) || 0;
  const { wedding, access } = useWedding();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [mealOptions, setMealOptions] = useState(Object.keys(MEAL_TIMES));
  const [name, setName] = useState<string | null>(null);
  const [time, setTime] = useState('08:30:00');
  const [diet, setDiet] = useState('');
  const [guests, setGuests] = useState(plan);
  const [dishes, setDishes] = useState<string[]>([]);
  const [dishDraft, setDishDraft] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents()
      .then((events) => setEvent(events.find((row) => row.id === params.eventId) ?? null))
      .catch((loadError) => setError(errorText(loadError)));
  }, [params.eventId]);

  function pickMeal(meal: string | null) {
    setName(meal);
    if (meal && MEAL_TIMES[meal]) {
      setTime(MEAL_TIMES[meal]);
    }
  }

  function addDish() {
    const dish = dishDraft.trim();
    if (dish && !dishes.includes(dish)) {
      setDishes([...dishes, dish]);
    }
    setDishDraft('');
  }

  async function save() {
    if (!wedding || !params.eventId) {
      return;
    }
    if (!name) {
      setError('Choose the meal or add your own.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const meal = createdId ? { id: createdId } : await one<{ id: string }>(
        supabase
          .from('meals')
          .insert({
            wedding_id: wedding.id,
            event_id: params.eventId,
            name,
            meal_time: time,
            diet_notes: diet.trim() || null,
            headcount: guests === plan ? null : guests,
          })
          .select('id')
          .single()
      );
      setCreatedId(meal.id);
      if (dishes.length > 0) {
        await run(
          supabase.from('dishes').insert(dishes.map((dish) => ({ wedding_id: wedding.id, meal_id: meal.id, name: dish })))
        );
      }
      navigation.goBack();
    } catch (saveError) {
      setError(errorText(saveError));
      setSaving(false);
    }
  }

  const back = { label: 'Cancel', onPress: () => navigation.goBack() };

  if (access('food') !== 'edit') {
    return (
      <Screen back={back}>
        <Note>You can view meals but not add them.</Note>
      </Screen>
    );
  }

  return (
    <Screen back={back} gap={22}>
      <View style={styles.head}>
        <Title>Add a meal</Title>
        {event ? <Lead>{`For ${event.name} · ${dayDate(event.event_date)}`}</Lead> : null}
      </View>
      <View style={styles.group}>
        <Label>Which meal?</Label>
        <EditableChips
          options={mealOptions}
          onOptionsChange={setMealOptions}
          value={name}
          onChange={pickMeal}
          placeholder="Add your own, e.g. Welcome drinks"
        />
      </View>
      <View style={styles.group}>
        <Label right={timeLabel(time)}>Time</Label>
        <TimePicker value={time} onChange={setTime} />
      </View>
      <Field
        label="Diet notes"
        hint="Optional"
        placeholder="e.g. pure vegetarian, no onion or garlic"
        value={diet}
        onChangeText={setDiet}
      />
      <View style={styles.group}>
        <View style={styles.between}>
          <Label>How many guests?</Label>
          <Stepper name="guests" value={guests} onChange={setGuests} step={5} />
        </View>
        <Text style={styles.hint}>Filled in from the guest list. Change it only if this meal is different.</Text>
      </View>
      <View style={styles.group}>
        <Label right={<Text style={styles.hint}>Optional</Text>}>First dishes</Label>
        {dishes.length > 0 ? (
          <View style={styles.wrap}>
            {dishes.map((dish) => (
              <Chip
                key={dish}
                label={dish}
                selected={false}
                onPress={() => undefined}
                onRemove={() => setDishes(dishes.filter((item) => item !== dish))}
              />
            ))}
          </View>
        ) : null}
        <View style={styles.addRow}>
          <Input
            small
            style={styles.flex}
            accessibilityLabel="Add a dish"
            placeholder="Add a dish, e.g. Upma"
            value={dishDraft}
            onChangeText={setDishDraft}
            onSubmitEditing={addDish}
          />
          <AddButton onPress={addDish} />
        </View>
      </View>
      <ErrorText>{error}</ErrorText>
      <PrimaryButton label={saving ? 'Saving…' : 'Save meal'} onPress={save} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: 4 },
  group: { gap: 8 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  addRow: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
});
