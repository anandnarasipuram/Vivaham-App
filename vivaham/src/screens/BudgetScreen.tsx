import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import Screen from '../components/Screen';
import { Badge, Card, EmptyBox, ErrorText, Note, ProgressBar, rowStyles, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, rows, run, useFocusData } from '../lib/data';
import { parseAmount, rupees } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { goHome, useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';

type Expense = {
  id: string;
  event_id: string | null;
  description: string;
  category: string | null;
  amount: number;
  paid: number | null;
  paid_by: string | null;
};
type Purchase = { event_id: string | null; price: number; status: string };

function status(expense: Expense) {
  const amount = Number(expense.amount ?? 0);
  const paid = Number(expense.paid ?? 0);
  if (paid <= 0) {
    return { label: 'Quoted', tone: 'gold' as const };
  }
  if (paid < amount) {
    return { label: `Advance paid ${rupees(paid)}`, tone: 'rose' as const };
  }
  return { label: 'Settled', tone: 'green' as const };
}

export default function BudgetScreen() {
  const navigation = useNav();
  const { wedding, access, reload: reloadWedding } = useWedding();
  const canSee = access('budget') !== 'none';
  const canEdit = access('budget') === 'edit';
  const isAdmin = wedding?.role === 'admin';
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitText, setLimitText] = useState('');
  const [saving, setSaving] = useState(false);
  const [limitError, setLimitError] = useState('');

  const { data, error } = useFocusData(async () => {
    if (!canSee) {
      return { events: [] as EventRow[], expenses: [] as Expense[], purchases: [] as Purchase[] };
    }
    const [events, expenses, purchases] = await Promise.all([
      fetchEvents(),
      rows<Expense>(
        supabase.from('expenses').select('id, event_id, description, category, amount, paid, paid_by').order('created_at')
      ),
      access('shopping') !== 'none'
        ? rows<Purchase>(supabase.from('shopping_items').select('event_id, price, status'))
        : Promise.resolve([]),
    ]);
    return { events, expenses, purchases };
  }, [canSee]);

  async function saveLimit() {
    if (!wedding) {
      return;
    }
    setSaving(true);
    setLimitError('');
    try {
      const value = limitText.trim() ? parseAmount(limitText) : null;
      await run(supabase.from('weddings').update({ budget_limit: value }).eq('id', wedding.id));
      await reloadWedding();
      setEditingLimit(false);
    } catch (saveError) {
      setLimitError(errorText(saveError));
    }
    setSaving(false);
  }

  const back = { label: 'Home', onPress: () => goHome(navigation) };

  if (!canSee) {
    return (
      <Screen back={back}>
        <Title>Budget</Title>
        <Note>You don’t have access to Budget.</Note>
      </Screen>
    );
  }

  const events = data?.events ?? [];
  const expenses = data?.expenses ?? [];
  const purchases = data?.purchases ?? [];
  const sum = (list: number[]) => list.reduce((total, value) => total + value, 0);
  const committed = sum(expenses.map((row) => Number(row.amount ?? 0))) + sum(purchases.map((row) => Number(row.price ?? 0)));
  const paid =
    sum(expenses.map((row) => Number(row.paid ?? 0))) +
    sum(purchases.filter((row) => row.status === 'bought').map((row) => Number(row.price ?? 0)));
  const limit = wedding?.budgetLimit ?? null;
  const ratio = limit ? committed / limit : 0;

  const byEvent = [
    {
      key: 'whole',
      name: 'Whole wedding',
      shopping: sum(purchases.filter((row) => !row.event_id).map((row) => Number(row.price ?? 0))),
      other: sum(expenses.filter((row) => !row.event_id).map((row) => Number(row.amount ?? 0))),
    },
    ...events.map((event) => ({
      key: event.id,
      name: event.name,
      shopping: sum(purchases.filter((row) => row.event_id === event.id).map((row) => Number(row.price ?? 0))),
      other: sum(expenses.filter((row) => row.event_id === event.id).map((row) => Number(row.amount ?? 0))),
    })),
  ];

  const categories = new Map<string, number>();
  const shoppingTotal = sum(purchases.map((row) => Number(row.price ?? 0)));
  if (shoppingTotal > 0) {
    categories.set('Clothing & shopping', shoppingTotal);
  }
  expenses.forEach((row) => {
    const key = row.category || 'Other';
    categories.set(key, (categories.get(key) ?? 0) + Number(row.amount ?? 0));
  });
  const eventName = new Map(events.map((event) => [event.id, event.name]));

  return (
    <Screen back={back}>
      <Title>Budget</Title>
      <ErrorText>{error}</ErrorText>
      {!data && !error ? <Note>Loading budget…</Note> : null}

      <View style={styles.hero}>
        <View style={styles.limitRow}>
          <View style={styles.flex}>
            <Text style={styles.heroLabel}>Budget limit</Text>
            {editingLimit ? (
              <TextInput
                accessibilityLabel="Budget limit in rupees"
                style={styles.limitInput}
                keyboardType="number-pad"
                placeholder="e.g. 2500000"
                placeholderTextColor={colors.goldLight}
                value={limitText}
                onChangeText={setLimitText}
                autoFocus
              />
            ) : (
              <Text style={styles.limit}>{limit !== null ? rupees(limit) : 'Not set yet'}</Text>
            )}
          </View>
          {isAdmin ? (
            <Pressable
              accessibilityRole="button"
              style={styles.limitButton}
              disabled={saving}
              onPress={() => {
                if (editingLimit) {
                  saveLimit();
                } else {
                  setLimitText(limit !== null ? String(limit) : '');
                  setEditingLimit(true);
                }
              }}
            >
              <Text style={styles.limitButtonText}>
                {editingLimit ? (saving ? 'Saving…' : 'Save') : limit !== null ? 'Edit' : 'Set your budget limit'}
              </Text>
            </Pressable>
          ) : null}
        </View>
        {limitError ? <Text style={styles.heroError}>{limitError}</Text> : null}
        <View style={styles.heroStats}>
          <HeroStat label="Committed" value={rupees(committed)} />
          <HeroStat label="Paid so far" value={rupees(paid)} />
          <HeroStat label="Left" value={limit !== null ? rupees(limit - committed) : '—'} />
        </View>
        {limit ? (
          <View style={styles.heroBar}>
            <ProgressBar ratio={ratio} track="rgba(255,255,255,0.2)" />
            <Text style={styles.heroLabel}>
              {`${Math.round(ratio * 100)}% of the limit committed${committed > limit ? ' · over the limit' : ''}`}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>By event</Text>
        <Card>
          {byEvent.map((row, index) => {
            const total = row.shopping + row.other;
            return (
              <View key={row.key} style={[rowStyles.row, styles.eventRow, index < byEvent.length - 1 && rowStyles.divider]}>
                <View style={rowStyles.grow}>
                  <Text style={styles.rowName}>{row.name}</Text>
                  {total > 0 ? (
                    <Text style={rowStyles.meta}>{`Shopping ${rupees(row.shopping)} · Other ${rupees(row.other)}`}</Text>
                  ) : null}
                </View>
                <Text style={[rowStyles.value, total === 0 && styles.muted]}>{rupees(total)}</Text>
              </View>
            );
          })}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>By category</Text>
        {categories.size === 0 ? (
          <Note>Nothing committed yet.</Note>
        ) : (
          <Card style={styles.categories}>
            {[...categories.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([name, amount]) => (
                <View key={name} style={styles.category}>
                  <View style={styles.categoryHead}>
                    <Text style={styles.rowName}>{name}</Text>
                    <Text style={rowStyles.value}>{rupees(amount)}</Text>
                  </View>
                  <ProgressBar ratio={committed > 0 ? amount / committed : 0} />
                  {name === 'Clothing & shopping' ? <Text style={rowStyles.meta}>Counted from the Shopping list</Text> : null}
                </View>
              ))}
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>Expenses</Text>
        {data && expenses.length === 0 ? (
          <EmptyBox title="No expenses yet">
            Add venue, catering or decor payments here. Shopping is already counted above.
          </EmptyBox>
        ) : null}
        {expenses.length > 0 ? (
          <Card>
            {expenses.map((row, index) => {
              const state = status(row);
              return (
                <View key={row.id} style={[rowStyles.row, styles.expense, index < expenses.length - 1 && rowStyles.divider]}>
                  <View style={rowStyles.grow}>
                    <Text style={rowStyles.name}>{row.description}</Text>
                    <Text style={rowStyles.meta}>
                      {[
                        row.category,
                        row.event_id ? eventName.get(row.event_id) : 'Whole wedding',
                        row.paid_by ? `Paid by ${row.paid_by}` : '',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                    <View style={styles.badge}>
                      <Badge label={state.label} tone={state.tone} />
                    </View>
                  </View>
                  <Text style={rowStyles.value}>{rupees(Number(row.amount ?? 0))}</Text>
                </View>
              );
            })}
          </Card>
        ) : null}
      </View>

      {canEdit ? (
        <PrimaryButton size="medium" label="+ Add an expense" onPress={() => navigation.navigate('AddExpense')} />
      ) : null}
    </Screen>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.flex}>
      <Text style={styles.heroSmall}>{label}</Text>
      <Text style={styles.heroValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  hero: {
    backgroundColor: colors.maroon,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: 18,
    gap: 14,
  },
  limitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.goldLight },
  limit: { fontFamily: fonts.extrabold, fontSize: 30, color: colors.white },
  limitInput: {
    height: 48,
    borderBottomWidth: 2,
    borderBottomColor: colors.gold,
    fontFamily: fonts.extrabold,
    fontSize: 24,
    color: colors.white,
  },
  limitButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: colors.cream,
    justifyContent: 'center',
    maxWidth: 170,
  },
  limitButtonText: { fontFamily: fonts.bold, fontSize: 14, color: colors.maroon, textAlign: 'center' },
  heroError: { fontFamily: fonts.semibold, fontSize: 14, color: colors.goldLight },
  heroStats: { flexDirection: 'row', gap: 8 },
  heroSmall: { fontFamily: fonts.medium, fontSize: 12, color: colors.goldLight },
  heroValue: { fontFamily: fonts.bold, fontSize: 16, color: colors.white },
  heroBar: { gap: 6 },
  section: { gap: 10 },
  h2: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink },
  eventRow: { minHeight: 52, paddingRight: 16 },
  rowName: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  muted: { color: colors.muted },
  categories: { paddingVertical: 14, paddingHorizontal: 16, gap: 16 },
  category: { gap: 8 },
  categoryHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  expense: { alignItems: 'flex-start', paddingRight: 16 },
  badge: { flexDirection: 'row', marginTop: 4 },
});
