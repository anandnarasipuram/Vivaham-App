import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton, PrimaryButton } from '../components/Buttons';
import Collapsible from '../components/Collapsible';
import { ConfirmDialog } from '../components/Dialog';
import Icon from '../components/Icon';
import Screen from '../components/Screen';
import SelectRow from '../components/SelectRow';
import TickBox from '../components/TickBox';
import { Card, EmptyBox, ErrorText, Note, ProgressBar, rowStyles, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, rows, run, useFocusData } from '../lib/data';
import { shortDate, todayIso } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { goHome, useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';

type Task = {
  id: string;
  event_id: string | null;
  title: string;
  owner: string | null;
  due_date: string | null;
  status: string;
};

const ALL = 'all';
const GENERAL = 'general';

export default function TodoScreen() {
  const navigation = useNav();
  const { access } = useWedding();
  const canSee = access('todo') !== 'none';
  const canEdit = access('todo') === 'edit';
  const [who, setWho] = useState(ALL);
  const [where, setWhere] = useState(ALL);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const { data, error, reload } = useFocusData(async () => {
    if (!canSee) {
      return { events: [] as EventRow[], tasks: [] as Task[] };
    }
    const [events, tasks] = await Promise.all([
      fetchEvents(),
      rows<Task>(supabase.from('tasks').select('id, event_id, title, owner, due_date, status').order('created_at')),
    ]);
    return { events, tasks };
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

  const back = { label: 'Home', onPress: () => goHome(navigation) };

  if (!canSee) {
    return (
      <Screen back={back}>
        <Title>To-do</Title>
        <Note>You don’t have access to To-do.</Note>
      </Screen>
    );
  }

  const events = data?.events ?? [];
  const all = data?.tasks ?? [];
  const eventName = new Map(events.map((event) => [event.id, event.name]));
  const owners = [...new Set(all.map((task) => task.owner).filter(Boolean))].sort() as string[];
  const tasks = all.filter(
    (task) =>
      (who === ALL || task.owner === who) &&
      (where === ALL || (where === GENERAL ? !task.event_id : task.event_id === where))
  );
  const open = tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999') || a.title.localeCompare(b.title));
  const done = tasks.filter((task) => task.status === 'done');
  const today = todayIso();

  return (
    <Screen back={back}>
      <View style={styles.titleRow}>
        <Title>To-do</Title>
        {canEdit ? <PrimaryButton size="small" label="+ Add a task" onPress={() => navigation.navigate('AddTask')} /> : null}
      </View>
      <ErrorText>{error || actionError}</ErrorText>
      {!data && !error ? <Note>Loading tasks…</Note> : null}

      <View style={styles.filters}>
        <View style={styles.filter}>
          <Text style={styles.filterLabel}>Show tasks for</Text>
          <SelectRow
            title="Show tasks for"
            options={[{ key: ALL, label: 'Everyone' }, ...owners.map((owner) => ({ key: owner, label: owner }))]}
            value={who}
            onChange={setWho}
          />
        </View>
        <View style={styles.filter}>
          <Text style={styles.filterLabel}>Show tasks in</Text>
          <SelectRow
            title="Show tasks in"
            options={[
              { key: ALL, label: 'All' },
              { key: GENERAL, label: 'General' },
              ...events.map((event) => ({ key: event.id, label: event.name })),
            ]}
            value={where}
            onChange={setWhere}
          />
        </View>
      </View>

      {tasks.length > 0 ? (
        <View style={styles.progress}>
          <Text style={styles.progressText}>{`${done.length} of ${tasks.length} tasks done`}</Text>
          <ProgressBar ratio={done.length / tasks.length} color={colors.green} />
        </View>
      ) : null}

      {open.length > 0 ? (
        <Card>
          {open.map((task, index) => {
            const overdue = Boolean(task.due_date && task.due_date < today);
            return (
              <View key={task.id} style={[rowStyles.row, styles.tall, index < open.length - 1 && rowStyles.divider]}>
                <TickBox
                  checked={false}
                  label={`Mark ${task.title} as done`}
                  disabled={!canEdit || busy}
                  onPress={() => act(() => supabase.from('tasks').update({ status: 'done' }).eq('id', task.id))}
                />
                <View style={rowStyles.grow}>
                  <Text style={rowStyles.name}>{task.title}</Text>
                  <Text style={rowStyles.meta}>
                    {[task.owner, task.event_id ? eventName.get(task.event_id) : 'General'].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                {task.due_date ? (
                  <Text style={[styles.date, overdue && styles.overdue]}>
                    {overdue ? `Overdue · ${shortDate(task.due_date)}` : shortDate(task.due_date)}
                  </Text>
                ) : null}
                {canEdit ? (
                  <IconButton label={`Delete ${task.title}`} onPress={() => setDeleting(task)}>
                    <Icon name="trash" color={colors.maroon} size={18} />
                  </IconButton>
                ) : null}
              </View>
            );
          })}
        </Card>
      ) : data ? (
        <EmptyBox>
          {all.length === 0
            ? canEdit
              ? 'No tasks yet. Tap “+ Add a task” to add the first one.'
              : 'No tasks yet.'
            : tasks.length === 0
              ? 'No tasks match these filters.'
              : 'All done here. Nothing left to do.'}
        </EmptyBox>
      ) : null}

      <Collapsible title={`Completed (${done.length})`}>
        {done.length > 0 ? (
          <Card>
            {done.map((task, index) => (
              <View key={task.id} style={[rowStyles.row, index < done.length - 1 && rowStyles.divider]}>
                <TickBox
                  checked
                  label={`Mark ${task.title} as not done`}
                  disabled={!canEdit || busy}
                  onPress={() => act(() => supabase.from('tasks').update({ status: 'open' }).eq('id', task.id))}
                />
                <Text style={styles.doneText}>{[task.title, task.owner].filter(Boolean).join(' · ')}</Text>
              </View>
            ))}
          </Card>
        ) : (
          <Note>Nothing completed yet.</Note>
        )}
      </Collapsible>

      <ConfirmDialog
        visible={deleting !== null}
        title="Delete this task?"
        message={deleting ? `“${deleting.title}” will be removed from the list.` : ''}
        busy={busy}
        error={actionError}
        onConfirm={async () => {
          if (deleting) {
            await act(() => supabase.from('tasks').delete().eq('id', deleting.id));
            setDeleting(null);
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  filters: { flexDirection: 'row', gap: 10 },
  filter: { flex: 1, gap: 6 },
  filterLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.brownInk },
  progress: { gap: 8 },
  progressText: { fontFamily: fonts.medium, fontSize: 15, color: colors.brownInk },
  tall: { minHeight: 64 },
  date: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted, maxWidth: 90, textAlign: 'right' },
  overdue: { fontFamily: fonts.bold, color: colors.maroon },
  doneText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.muted, textDecorationLine: 'line-through' },
});
