import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AddButton, IconButton, PrimaryButton } from '../components/Buttons';
import { Chip } from '../components/Chips';
import { ConfirmDialog } from '../components/Dialog';
import { Input } from '../components/Field';
import Icon from '../components/Icon';
import Screen from '../components/Screen';
import SelectRow from '../components/SelectRow';
import { Card, EmptyBox, ErrorText, Note, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, rows, run, useFocusData } from '../lib/data';
import { foodPlan, Invite } from '../lib/food';
import { plural, timeLabel } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { goHome, useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';
import { eventOption } from './RequirementsListScreen';

type Meal = {
  id: string;
  event_id: string;
  name: string;
  meal_time: string | null;
  diet_notes: string | null;
  headcount: number | null;
};
type Dish = { id: string; meal_id: string; name: string };

export default function FoodScreen() {
  const navigation = useNav();
  const { wedding, access } = useWedding();
  const canSee = access('food') !== 'none';
  const canEdit = access('food') === 'edit';
  const [eventId, setEventId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<Meal | null>(null);

  const { data, error, reload } = useFocusData(async () => {
    if (!canSee) {
      return { events: [] as EventRow[], meals: [] as Meal[], dishes: [] as Dish[], invites: [] as Invite[] };
    }
    const [events, meals, dishes, invites] = await Promise.all([
      fetchEvents(),
      rows<Meal>(supabase.from('meals').select('id, event_id, name, meal_time, diet_notes, headcount').order('meal_time')),
      rows<Dish>(supabase.from('dishes').select('id, meal_id, name').order('created_at')),
      access('guests') !== 'none'
        ? rows<Invite>(supabase.from('guest_events').select('event_id, rsvp, party_size'))
        : Promise.resolve([]),
    ]);
    return { events, meals, dishes, invites };
  }, [canSee]);

  async function act(action: () => PromiseLike<{ error: { message: string } | null }>) {
    setBusy(true);
    setActionError('');
    try {
      await run(action());
      await reload();
    } catch (failure) {
      setActionError(errorText(failure));
    }
    setBusy(false);
  }

  async function addDish(meal: Meal) {
    const name = (drafts[meal.id] ?? '').trim();
    if (!name || !wedding) {
      return;
    }
    await act(() => supabase.from('dishes').insert({ wedding_id: wedding.id, meal_id: meal.id, name }));
    setDrafts({ ...drafts, [meal.id]: '' });
  }

  async function deleteMeal() {
    if (!deleting) {
      return;
    }
    setBusy(true);
    setActionError('');
    try {
      await run(supabase.from('dishes').delete().eq('meal_id', deleting.id));
      await run(supabase.from('meals').delete().eq('id', deleting.id));
      setDeleting(null);
      await reload();
    } catch (failure) {
      setActionError(errorText(failure));
    }
    setBusy(false);
  }

  const back = { label: 'Home', onPress: () => goHome(navigation) };

  if (!canSee) {
    return (
      <Screen back={back}>
        <Title>Food & menus</Title>
        <Note>You don’t have access to Food.</Note>
      </Screen>
    );
  }

  const events = data?.events ?? [];
  const selected = events.find((event) => event.id === eventId) ?? events[0];
  const plan = selected ? foodPlan(selected, data?.invites ?? []) : null;
  const meals = (data?.meals ?? []).filter((meal) => meal.event_id === selected?.id);

  return (
    <Screen back={back}>
      <Title>Food & menus</Title>
      <ErrorText>{error || actionError}</ErrorText>
      {!data && !error ? <Note>Loading meals…</Note> : null}
      {data && events.length === 0 ? <EmptyBox>Add an event first, then plan its meals.</EmptyBox> : null}

      {selected && plan ? (
        <>
          <SelectRow title="Show meals for" options={events.map(eventOption)} value={selected.id} onChange={setEventId} />
          <View style={styles.plan}>
            <View style={styles.plates}>
              <Text style={styles.platesValue}>{plan.count}</Text>
              <Text style={styles.platesLabel}>plates</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.planTitle}>{`Plan food for ${plural(plan.count, 'guest', 'guests')}`}</Text>
              <Text style={styles.planLine}>{plan.line}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.h2}>Meals</Text>
            {meals.length === 0 ? <EmptyBox>{`No meals planned for ${selected.name} yet.`}</EmptyBox> : null}
            {meals.map((meal) => {
              const dishes = (data?.dishes ?? []).filter((dish) => dish.meal_id === meal.id);
              const meta = [
                timeLabel(meal.meal_time),
                `For ${plural(meal.headcount ?? plan.count, 'guest', 'guests')}`,
                plural(dishes.length, 'dish', 'dishes'),
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <Card key={meal.id} style={styles.meal}>
                  <View style={styles.mealHead}>
                    <View style={styles.flex}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.small}>{meta}</Text>
                      {meal.diet_notes ? <Text style={styles.small}>{meal.diet_notes}</Text> : null}
                    </View>
                    {canEdit ? (
                      <IconButton label="Meal options" onPress={() => setDeleting(meal)}>
                        <Icon name="dots" color={colors.brownInk} size={20} />
                      </IconButton>
                    ) : null}
                  </View>
                  {dishes.length > 0 ? (
                    <View style={styles.dishes}>
                      {dishes.map((dish) => (
                        <Chip
                          key={dish.id}
                          label={dish.name}
                          selected={false}
                          onPress={() => undefined}
                          onRemove={
                            canEdit && !busy
                              ? () => act(() => supabase.from('dishes').delete().eq('id', dish.id))
                              : undefined
                          }
                        />
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noDishes}>No dishes yet</Text>
                  )}
                  {canEdit ? (
                    <View style={styles.addRow}>
                      <Input
                        small
                        style={styles.flex}
                        accessibilityLabel={`Add a dish to ${meal.name}`}
                        placeholder="Add a dish, e.g. Upma"
                        value={drafts[meal.id] ?? ''}
                        onChangeText={(text) => setDrafts({ ...drafts, [meal.id]: text })}
                        onSubmitEditing={() => addDish(meal)}
                      />
                      <AddButton onPress={() => addDish(meal)} disabled={busy} />
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </View>

          {canEdit ? (
            <PrimaryButton
              size="medium"
              label="+ Add a meal"
              onPress={() => navigation.navigate('AddMeal', { eventId: selected.id, plan: plan.count })}
            />
          ) : null}
        </>
      ) : null}

      <ConfirmDialog
        visible={deleting !== null}
        title="Delete this meal?"
        message={deleting ? `${deleting.name} and its dishes will be removed.` : ''}
        confirmLabel="Yes, delete meal"
        busy={busy}
        error={actionError}
        onConfirm={deleteMeal}
        onCancel={() => setDeleting(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.tintGold,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    borderRadius: 16,
    padding: 16,
  },
  plates: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platesValue: { fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 28, color: colors.ink },
  platesLabel: { fontFamily: fonts.semibold, fontSize: 11, color: colors.goldInk },
  planTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  planLine: { fontFamily: fonts.medium, fontSize: 13, color: colors.brownInk },
  section: { gap: 10 },
  h2: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink },
  meal: { padding: 16, gap: 12 },
  mealHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealName: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  small: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  dishes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  noDishes: {
    backgroundColor: colors.cream,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  addRow: { flexDirection: 'row', gap: 8 },
});
