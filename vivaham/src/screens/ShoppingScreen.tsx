import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { IconButton, PrimaryButton, SecondaryButton } from '../components/Buttons';
import { ChipGroup } from '../components/Chips';
import Collapsible from '../components/Collapsible';
import { ConfirmDialog } from '../components/Dialog';
import Icon from '../components/Icon';
import Screen from '../components/Screen';
import SelectRow from '../components/SelectRow';
import TickBox from '../components/TickBox';
import { Card, EmptyBox, ErrorText, Note, ProgressBar, rowStyles, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, rows, run, useFocusData } from '../lib/data';
import { parseAmount, plural, rupees } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { goHome, useNav, useParams } from '../navigation/nav';
import { colors, fonts } from '../theme';

type Item = { id: string; event_id: string | null; person: string | null; item: string; price: number; status: string };
type Draft = { event_id: string | null; person: string | null; item: string; price: string; status: string };

const STATUSES = ['to buy', 'ordered', 'bought'].map((status) => ({ key: status, label: status }));

export default function ShoppingScreen() {
  const navigation = useNav();
  const params = useParams<{ eventId: string }>();
  const { access } = useWedding();
  const canSee = access('shopping') !== 'none';
  const canEdit = access('shopping') === 'edit';
  const [filter, setFilter] = useState(params.eventId ?? 'all');
  const [actionError, setActionError] = useState('');
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  useEffect(() => {
    if (params.eventId) {
      setFilter(params.eventId);
    }
  }, [params.eventId]);

  const { data, error, reload } = useFocusData(async () => {
    if (!canSee) {
      return { events: [] as EventRow[], items: [] as Item[] };
    }
    const [events, items] = await Promise.all([
      fetchEvents(),
      rows<Item>(supabase.from('shopping_items').select('id, event_id, person, item, price, status').order('created_at')),
    ]);
    return { events, items };
  }, [canSee]);

  useEffect(() => {
    const next: Record<string, Draft> = {};
    (data?.items ?? []).forEach((row) => {
      next[row.id] = {
        event_id: row.event_id,
        person: row.person,
        item: row.item,
        price: String(Number(row.price ?? 0)),
        status: row.status,
      };
    });
    setDrafts(next);
  }, [data]);

  async function act(action: () => PromiseLike<{ error: { message: string } | null }>) {
    setActionError('');
    setBusy(true);
    try {
      await run(action());
      await reload();
    } catch (failure) {
      setActionError(errorText(failure));
    }
    setBusy(false);
  }

  async function saveTable() {
    if (!data) {
      return;
    }
    setActionError('');
    setBusy(true);
    try {
      for (const row of data.items) {
        const draft = drafts[row.id];
        if (!draft) {
          continue;
        }
        const price = parseAmount(draft.price);
        const changed =
          draft.event_id !== row.event_id ||
          draft.person !== row.person ||
          draft.item.trim() !== row.item ||
          price !== Number(row.price ?? 0) ||
          draft.status !== row.status;
        if (changed && draft.item.trim()) {
          await run(
            supabase
              .from('shopping_items')
              .update({ event_id: draft.event_id, person: draft.person, item: draft.item.trim(), price, status: draft.status })
              .eq('id', row.id)
          );
        }
      }
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
        <Title>Clothing & shopping</Title>
        <Note>You don’t have access to Shopping.</Note>
      </Screen>
    );
  }

  const events = data?.events ?? [];
  const eventName = new Map(events.map((event) => [event.id, event.name]));
  const all = data?.items ?? [];
  const items = filter === 'all' ? all : all.filter((row) => row.event_id === filter);
  const open = items.filter((row) => row.status !== 'bought');
  const bought = items.filter((row) => row.status === 'bought');
  const total = items.reduce((sum, row) => sum + Number(row.price ?? 0), 0);
  const spent = bought.reduce((sum, row) => sum + Number(row.price ?? 0), 0);
  const people = [...new Set(all.map((row) => row.person).filter(Boolean))] as string[];
  const forLine = (row: Item) =>
    [row.person ? `For ${row.person}` : '', row.event_id ? eventName.get(row.event_id) : ''].filter(Boolean).join(' · ');

  return (
    <Screen back={back}>
      <Title>Clothing & shopping</Title>
      <ErrorText>{error || actionError}</ErrorText>
      {!data && !error ? <Note>Loading shopping list…</Note> : null}

      {events.length > 0 ? (
        <View style={styles.group}>
          <Text style={styles.show}>Show</Text>
          <ChipGroup
            columns={3}
            options={[{ key: 'all', label: 'All events' }, ...events.map((event) => ({ key: event.id, label: event.name }))]}
            selected={[filter]}
            onPress={setFilter}
          />
        </View>
      ) : null}

      {data ? (
        <Card style={styles.summary}>
          <View style={styles.stats}>
            <Stat label="Total cost" value={rupees(total)} />
            <Stat label="Already bought" value={rupees(spent)} color={colors.green} />
            <Stat label="Items to buy" value={String(open.length)} />
          </View>
          <ProgressBar ratio={total > 0 ? spent / total : 0} color={colors.green} />
          <Text style={styles.small}>
            {items.length === 0
              ? 'Nothing on the list yet'
              : `${plural(bought.length, 'item', 'items')} of ${items.length} bought · ${rupees(total - spent)} still to spend`}
          </Text>
        </Card>
      ) : null}

      {open.length > 0 ? (
        <Card>
          {open.map((row, index) => (
            <View key={row.id} style={[rowStyles.row, styles.tall, index < open.length - 1 && rowStyles.divider]}>
              <TickBox
                checked={false}
                label={`Mark ${row.item} as bought`}
                disabled={!canEdit || busy}
                onPress={() => act(() => supabase.from('shopping_items').update({ status: 'bought' }).eq('id', row.id))}
              />
              <View style={rowStyles.grow}>
                <Text style={rowStyles.name}>{row.item}</Text>
                {forLine(row) ? <Text style={rowStyles.meta}>{forLine(row)}</Text> : null}
              </View>
              <Text style={rowStyles.value}>{rupees(Number(row.price ?? 0))}</Text>
              {canEdit ? (
                <IconButton label={`Delete ${row.item}`} onPress={() => setDeleting(row)}>
                  <Icon name="trash" color={colors.maroon} size={18} />
                </IconButton>
              ) : null}
            </View>
          ))}
        </Card>
      ) : data ? (
        <EmptyBox>
          {items.length === 0
            ? canEdit
              ? 'Nothing to buy yet. Tap “+ Add an item” to start the list.'
              : 'Nothing to buy yet.'
            : 'Everything on this list is bought.'}
        </EmptyBox>
      ) : null}

      <Collapsible title={`Already bought (${bought.length})`}>
        {bought.length > 0 ? (
          <Card>
            {bought.map((row, index) => (
              <View key={row.id} style={[rowStyles.row, index < bought.length - 1 && rowStyles.divider]}>
                <TickBox
                  checked
                  label={`Mark ${row.item} as not bought`}
                  disabled={!canEdit || busy}
                  onPress={() => act(() => supabase.from('shopping_items').update({ status: 'to buy' }).eq('id', row.id))}
                />
                <Text style={styles.doneText}>{[row.item, row.person ? `For ${row.person}` : ''].filter(Boolean).join(' · ')}</Text>
                <Text style={styles.donePrice}>{rupees(Number(row.price ?? 0))}</Text>
              </View>
            ))}
          </Card>
        ) : (
          <Note>Nothing bought yet.</Note>
        )}
      </Collapsible>

      {canEdit && items.length > 0 ? (
        <Collapsible title="Edit details">
          <Card style={styles.editCard}>
            <Text style={styles.small}>Change anything in the table, then save. Swipe sideways to see all columns.</Text>
            <ScrollView horizontal keyboardShouldPersistTaps="handled">
              <View>
                <View style={styles.tableRow}>
                  {['Event', 'Person', 'Item', 'Price (₹)', 'Status'].map((heading, index) => (
                    <Text key={heading} style={[styles.th, { width: WIDTHS[index] }]}>
                      {heading}
                    </Text>
                  ))}
                </View>
                {items.map((row) => {
                  const draft = drafts[row.id];
                  if (!draft) {
                    return null;
                  }
                  const update = (patch: Partial<Draft>) => setDrafts({ ...drafts, [row.id]: { ...draft, ...patch } });
                  const personOptions = [...new Set([...people, ...(draft.person ? [draft.person] : [])])];
                  return (
                    <View key={row.id} style={styles.tableRow}>
                      <View style={{ width: WIDTHS[0] }}>
                        <SelectRow
                          small
                          title={`Event for ${row.item}`}
                          options={events.map((event) => ({ key: event.id, label: event.name }))}
                          value={draft.event_id}
                          onChange={(event_id) => update({ event_id })}
                        />
                      </View>
                      <View style={{ width: WIDTHS[1] }}>
                        <SelectRow
                          small
                          title={`Person for ${row.item}`}
                          placeholder="Nobody"
                          options={personOptions.map((name) => ({ key: name, label: name }))}
                          value={draft.person}
                          onChange={(person) => update({ person })}
                        />
                      </View>
                      <TextInput
                        accessibilityLabel="Item name"
                        style={[styles.cell, { width: WIDTHS[2] }]}
                        value={draft.item}
                        onChangeText={(item) => update({ item })}
                      />
                      <TextInput
                        accessibilityLabel={`Price of ${row.item}`}
                        keyboardType="number-pad"
                        style={[styles.cell, styles.right, { width: WIDTHS[3] }]}
                        value={draft.price}
                        onChangeText={(price) => update({ price })}
                      />
                      <View style={{ width: WIDTHS[4] }}>
                        <SelectRow
                          small
                          title={`Status of ${row.item}`}
                          options={STATUSES}
                          value={draft.status}
                          onChange={(status) => update({ status })}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
            <SecondaryButton tone="maroon" label={busy ? 'Saving…' : 'Save changes'} onPress={saveTable} disabled={busy} />
          </Card>
        </Collapsible>
      ) : null}

      {canEdit ? (
        <PrimaryButton
          size="medium"
          label="+ Add an item"
          onPress={() => navigation.navigate('AddShoppingItem', { eventId: filter === 'all' ? undefined : filter })}
        />
      ) : null}

      <ConfirmDialog
        visible={deleting !== null}
        title="Delete this item?"
        message={deleting ? `${deleting.item} (${rupees(Number(deleting.price ?? 0))}) will be removed from the list.` : ''}
        busy={busy}
        error={actionError}
        onConfirm={async () => {
          if (deleting) {
            await act(() => supabase.from('shopping_items').delete().eq('id', deleting.id));
            setDeleting(null);
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </Screen>
  );
}

const WIDTHS = [130, 130, 150, 100, 110];

function Stat({ label, value, color = colors.ink }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  show: { fontFamily: fonts.bold, fontSize: 14, color: colors.brownInk },
  summary: { padding: 16, gap: 12 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, gap: 2 },
  statLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted },
  statValue: { fontFamily: fonts.extrabold, fontSize: 18 },
  small: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  tall: { minHeight: 64 },
  doneText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.muted, textDecorationLine: 'line-through' },
  donePrice: { fontFamily: fonts.medium, fontSize: 15, color: colors.muted },
  editCard: { padding: 12, gap: 12 },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  th: { fontFamily: fonts.bold, fontSize: 12, color: colors.muted, paddingHorizontal: 6 },
  cell: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ink,
  },
  right: { textAlign: 'right' },
});
