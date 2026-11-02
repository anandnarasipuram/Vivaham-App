import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import Calendar from '../components/Calendar';
import { ChipGroup, EditableChips } from '../components/Chips';
import Field from '../components/Field';
import Screen from '../components/Screen';
import { ErrorText, Label, Note, Title } from '../components/ui';
import { errorText, EventRow, fetchEvents, fetchPeople, run } from '../lib/data';
import { fullDate, plural } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';

const GENERAL = 'general';

export default function AddTaskScreen() {
  const navigation = useNav();
  const { wedding, access } = useWedding();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [title, setTitle] = useState('');
  const [people, setPeople] = useState<string[]>([]);
  const [owner, setOwner] = useState<string | null>(null);
  const [belongs, setBelongs] = useState(GENERAL);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchEvents(), fetchPeople((module) => access(module) !== 'none')])
      .then(([eventRows, names]) => {
        setEvents(eventRows);
        setPeople(names);
      })
      .catch((loadError) => setError(errorText(loadError)));
  }, [access]);

  async function save() {
    if (!wedding) {
      return;
    }
    if (!title.trim()) {
      setError('Write the task, for example Book train tickets.');
      return;
    }
    if (hasDeadline && !deadline) {
      setError('Pick the deadline date, or turn the deadline off.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await run(
        supabase.from('tasks').insert({
          wedding_id: wedding.id,
          event_id: belongs === GENERAL ? null : belongs,
          title: title.trim(),
          owner,
          due_date: hasDeadline ? deadline : null,
          status: 'open',
        })
      );
      navigation.goBack();
    } catch (saveError) {
      setError(errorText(saveError));
      setSaving(false);
    }
  }

  const back = { label: 'Cancel', onPress: () => navigation.goBack() };

  if (access('todo') !== 'edit') {
    return (
      <Screen back={back}>
        <Note>You can view tasks but not add them.</Note>
      </Screen>
    );
  }

  return (
    <Screen back={back} gap={22}>
      <Title>Add a task</Title>
      <Field label="Task" placeholder="e.g. Book train tickets" value={title} onChangeText={setTitle} />
      <View style={styles.group}>
        <Label right={<Text style={styles.hint}>{plural(people.length, 'person', 'people')}</Text>}>Who does it?</Label>
        <EditableChips options={people} onOptionsChange={setPeople} value={owner} onChange={setOwner} placeholder="Add a new name" />
      </View>
      <View style={styles.group}>
        <Label>Belongs to</Label>
        <ChipGroup
          options={[{ key: GENERAL, label: 'General' }, ...events.map((event) => ({ key: event.id, label: event.name }))]}
          selected={[belongs]}
          onPress={setBelongs}
        />
      </View>
      <View style={styles.group}>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: hasDeadline }}
          style={styles.switchRow}
          onPress={() => setHasDeadline(!hasDeadline)}
        >
          <View style={styles.flex}>
            <Text style={styles.switchLabel}>Set a deadline</Text>
            <Text style={styles.hint}>
              {hasDeadline ? (deadline ? `Due ${fullDate(deadline)}` : 'Pick a date below') : 'No deadline'}
            </Text>
          </View>
          <View style={[styles.track, hasDeadline && styles.trackOn]}>
            <View style={[styles.knob, hasDeadline && styles.knobOn]} />
          </View>
        </Pressable>
        {hasDeadline ? <Calendar value={deadline} onChange={setDeadline} /> : null}
      </View>
      <ErrorText>{error}</ErrorText>
      <PrimaryButton label={saving ? 'Saving…' : 'Add task'} onPress={save} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 10 },
  flex: { flex: 1, gap: 2 },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  switchRow: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  track: { width: 48, height: 28, borderRadius: 14, backgroundColor: colors.tintSand, padding: 3 },
  trackOn: { backgroundColor: colors.maroon },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white },
  knobOn: { alignSelf: 'flex-end' },
});
