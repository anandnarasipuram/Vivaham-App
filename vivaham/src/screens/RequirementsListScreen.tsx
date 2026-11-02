import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import Icon from '../components/Icon';
import Screen from '../components/Screen';
import SelectRow from '../components/SelectRow';
import { Badge, Card, EmptyBox, ErrorText, Lead, Note, rowStyles, Segmented, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, rows, run, useFocusData } from '../lib/data';
import { plural, shortDate } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { goHome, useNav, useParams } from '../navigation/nav';
import { colors, fonts } from '../theme';

type Requirement = {
  id: string;
  event_id: string;
  category: string | null;
  item: string;
  quantity: number | null;
  unit: string | null;
  assigned_to: string | null;
  status: string;
};

export function eventOption(event: EventRow) {
  return { key: event.id, label: `${event.name} · ${shortDate(event.event_date)}` };
}

function amount(row: { quantity: number | null; unit: string | null }) {
  return [row.quantity ?? '', row.unit ?? ''].join(' ').trim();
}

export default function RequirementsListScreen() {
  const navigation = useNav();
  const params = useParams<{ eventId: string }>();
  const { access } = useWedding();
  const canSee = access('requirements') !== 'none';
  const canEdit = access('requirements') === 'edit';
  const [view, setView] = useState('event');
  const [eventId, setEventId] = useState<string | null>(params.eventId ?? null);
  const [toggleError, setToggleError] = useState('');

  useEffect(() => {
    if (params.eventId) {
      setEventId(params.eventId);
      setView('event');
    }
  }, [params.eventId]);

  const { data, error, reload } = useFocusData(async () => {
    if (!canSee) {
      return { events: [] as EventRow[], items: [] as Requirement[] };
    }
    const [events, items] = await Promise.all([
      fetchEvents(),
      rows<Requirement>(
        supabase
          .from('requirements')
          .select('id, event_id, category, item, quantity, unit, assigned_to, status')
          .order('created_at')
      ),
    ]);
    return { events, items };
  }, [canSee]);

  const events = data?.events ?? [];
  const selected = events.find((event) => event.id === eventId) ?? events[0];

  async function toggle(row: Requirement) {
    setToggleError('');
    try {
      await run(
        supabase
          .from('requirements')
          .update({ status: row.status === 'done' ? 'needed' : 'done' })
          .eq('id', row.id)
      );
      await reload();
    } catch (updateError) {
      setToggleError(errorText(updateError));
    }
  }

  const back = { label: 'Home', onPress: () => goHome(navigation) };

  if (!canSee) {
    return (
      <Screen back={back}>
        <Title>Requirements</Title>
        <Note>You don’t have access to Requirements.</Note>
      </Screen>
    );
  }

  return (
    <Screen back={back} gap={16}>
      <View style={styles.head}>
        <Title>Requirements</Title>
        <Lead>Flowers, pooja items and decor each event needs, and who is arranging them.</Lead>
      </View>
      <Segmented
        options={[
          { key: 'event', label: 'By event' },
          { key: 'once', label: 'Buy once, use many' },
        ]}
        value={view}
        onChange={setView}
      />
      <ErrorText>{error || toggleError}</ErrorText>
      {!data && !error ? <Note>Loading requirements…</Note> : null}
      {data && events.length === 0 ? (
        <EmptyBox>Add an event first, then list what each event needs.</EmptyBox>
      ) : null}

      {data && selected && view === 'event' ? (
        <ByEvent
          events={events}
          selected={selected}
          items={data.items.filter((row) => row.event_id === selected.id)}
          onSelect={setEventId}
          onToggle={toggle}
          canEdit={canEdit}
        />
      ) : null}
      {data && events.length > 0 && view === 'once' ? <BuyOnce events={events} items={data.items} /> : null}

      {canEdit && events.length > 0 ? (
        <PrimaryButton
          size="medium"
          label="+ Add a requirement"
          onPress={() => navigation.navigate('AddRequirement', { eventId: selected?.id })}
        />
      ) : null}
    </Screen>
  );
}

function ByEvent({
  events,
  selected,
  items,
  onSelect,
  onToggle,
  canEdit,
}: {
  events: EventRow[];
  selected: EventRow;
  items: Requirement[];
  onSelect: (id: string) => void;
  onToggle: (row: Requirement) => void;
  canEdit: boolean;
}) {
  const arranged = items.filter((row) => row.status === 'done').length;
  const groups = new Map<string, Requirement[]>();
  items.forEach((row) => {
    const key = row.category || 'Other';
    groups.set(key, [...(groups.get(key) ?? []), row]);
  });

  return (
    <View style={styles.section}>
      <SelectRow title="Show requirements for" options={events.map(eventOption)} value={selected.id} onChange={onSelect} />
      <Text style={styles.counts}>
        <Text style={styles.countStrong}>{arranged}</Text> arranged ·{' '}
        <Text style={styles.countNeeded}>{items.length - arranged}</Text> still needed
      </Text>
      {items.length === 0 ? <EmptyBox>{`Nothing added for ${selected.name} yet.`}</EmptyBox> : null}
      {[...groups.entries()].map(([category, list]) => (
        <View key={category} style={styles.group}>
          <Text style={styles.category}>{category.toUpperCase()}</Text>
          <Card>
            {list.map((row, index) => {
              const done = row.status === 'done';
              return (
                <View key={row.id} style={[rowStyles.row, index < list.length - 1 && rowStyles.divider]}>
                  <View style={rowStyles.grow}>
                    <Text style={styles.item}>{row.item}</Text>
                    <Text style={rowStyles.meta}>
                      {[amount(row), row.assigned_to].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${row.item}: ${done ? 'Arranged' : 'Needed'}`}
                    disabled={!canEdit}
                    style={[styles.status, done ? styles.statusDone : styles.statusNeeded]}
                    onPress={() => onToggle(row)}
                  >
                    <Text style={[styles.statusText, { color: done ? colors.green : colors.maroon }]}>
                      {done ? 'Arranged' : 'Needed'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </Card>
        </View>
      ))}
    </View>
  );
}

function BuyOnce({ events, items }: { events: EventRow[]; items: Requirement[] }) {
  const groups = new Map<string, { item: string; unit: string; category: string; total: number; events: Set<string> }>();
  items.forEach((row) => {
    const key = `${row.item.trim().toLowerCase()}|${(row.unit ?? '').toLowerCase()}`;
    const group = groups.get(key) ?? {
      item: row.item.trim(),
      unit: row.unit ?? '',
      category: row.category || 'Other',
      total: 0,
      events: new Set<string>(),
    };
    group.total += Number(row.quantity ?? 0);
    group.events.add(row.event_id);
    groups.set(key, group);
  });
  const list = [...groups.values()].sort(
    (a, b) => b.events.size - a.events.size || a.item.localeCompare(b.item)
  );

  return (
    <View style={styles.section}>
      <View style={styles.info}>
        <Icon name="info" color={colors.goldInk} size={20} />
        <Text style={styles.infoText}>
          Items needed in more than one event are listed first, so you can buy them once and use them again.
        </Text>
      </View>
      {list.map((group) => (
        <Card key={`${group.item}|${group.unit}`} style={styles.onceCard}>
          <View style={styles.onceHead}>
            <Text style={styles.onceName}>{group.item}</Text>
            <Badge label={group.category} />
          </View>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Total needed</Text>
              <Text style={styles.statValue}>{`${group.total} ${group.unit}`.trim()}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>No. of events</Text>
              <Text style={styles.statValue}>{group.events.size}</Text>
            </View>
          </View>
          <View style={styles.usedIn}>
            <Text style={styles.statLabel}>Used in:</Text>
            {events
              .filter((event) => group.events.has(event.id))
              .map((event) => (
                <Badge key={event.id} tone="gold" label={`${event.name} · ${shortDate(event.event_date)}`} />
              ))}
          </View>
        </Card>
      ))}
      <EmptyBox>
        {list.length === 0
          ? 'Nothing added yet.'
          : `When the same item is added for two or more events, it shows here once with the combined total. ${plural(list.length, 'item', 'items')} so far.`}
      </EmptyBox>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { gap: 4 },
  section: { gap: 16 },
  counts: { fontFamily: fonts.medium, fontSize: 15, color: colors.brownInk },
  countStrong: { fontFamily: fonts.bold, color: colors.ink },
  countNeeded: { fontFamily: fonts.bold, color: colors.maroon },
  group: { gap: 8 },
  category: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.8, color: colors.muted },
  item: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  status: { minHeight: 36, paddingHorizontal: 12, borderRadius: 999, justifyContent: 'center' },
  statusDone: { backgroundColor: colors.tintGreen },
  statusNeeded: { backgroundColor: colors.tintRose },
  statusText: { fontFamily: fonts.bold, fontSize: 13 },
  info: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.tintGold,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  infoText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.brownInk },
  onceCard: { padding: 16, gap: 12 },
  onceHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  onceName: { flex: 1, fontFamily: fonts.bold, fontSize: 18, color: colors.ink },
  stats: { flexDirection: 'row', gap: 8, backgroundColor: colors.cream, borderRadius: 12, padding: 12 },
  stat: { flex: 1, gap: 2 },
  statLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted },
  statValue: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.ink },
  usedIn: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
});
