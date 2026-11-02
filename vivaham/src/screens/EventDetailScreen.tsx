import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AddButton, IconButton, LinkButton, SecondaryButton } from '../components/Buttons';
import Chevron from '../components/Chevron';
import EventPhotos from '../components/EventPhotos';
import Field from '../components/Field';
import Icon from '../components/Icon';
import Screen from '../components/Screen';
import TimePicker from '../components/TimePicker';
import { Card, ErrorText, Label, Note } from '../components/ui';
import { errorText, EventRow, one, rows, run, useFocusData } from '../lib/data';
import { fullDate, plural, rupees, shortTime, timeLabel } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { useNav, useParams } from '../navigation/nav';
import { colors, fonts } from '../theme';

type ScheduleItem = { id: string; start_time: string | null; activity: string; who: string | null };

type Detail = {
  event: EventRow;
  schedule: ScheduleItem[];
  confirmed: number;
  requirements: { category: string | null; status: string }[];
  shopping: { price: number }[];
};

export default function EventDetailScreen() {
  const navigation = useNav();
  const { eventId } = useParams<{ eventId: string }>();
  const { wedding, access } = useWedding();
  const canEdit = access('events') === 'edit';
  const [adding, setAdding] = useState(false);
  const [time, setTime] = useState('10:00:00');
  const [activity, setActivity] = useState('');
  const [who, setWho] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const { data, error, reload } = useFocusData<Detail>(async () => {
    const [event, schedule, guestRows, requirements, shopping] = await Promise.all([
      one<EventRow>(
        supabase
          .from('events')
          .select('id, name, event_date, start_time, expected_guests, dress_code, highlights, notes')
          .eq('id', eventId)
          .single()
      ),
      rows<ScheduleItem>(
        supabase
          .from('schedule_items')
          .select('id, start_time, activity, who')
          .eq('event_id', eventId)
          .order('start_time')
      ),
      access('guests') !== 'none'
        ? rows<{ party_size: number | null }>(
            supabase.from('guest_events').select('party_size').eq('event_id', eventId).eq('rsvp', 'yes')
          )
        : Promise.resolve([]),
      access('requirements') !== 'none'
        ? rows<{ category: string | null; status: string }>(
            supabase.from('requirements').select('category, status').eq('event_id', eventId)
          )
        : Promise.resolve([]),
      access('shopping') !== 'none'
        ? rows<{ price: number }>(supabase.from('shopping_items').select('price').eq('event_id', eventId))
        : Promise.resolve([]),
    ]);
    return {
      event,
      schedule,
      confirmed: guestRows.reduce((sum, row) => sum + (row.party_size ?? 1), 0),
      requirements,
      shopping,
    };
  }, [eventId]);

  async function addTime() {
    if (!wedding || !activity.trim()) {
      setSaveError('Write what happens at this time.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await run(
        supabase.from('schedule_items').insert({
          wedding_id: wedding.id,
          event_id: eventId,
          start_time: time,
          activity: activity.trim(),
          who: who.trim() || null,
        })
      );
      setActivity('');
      setWho('');
      setAdding(false);
      await reload();
    } catch (insertError) {
      setSaveError(errorText(insertError));
    }
    setSaving(false);
  }

  async function removeTime(id: string) {
    try {
      await run(supabase.from('schedule_items').delete().eq('id', id));
      await reload();
    } catch (deleteError) {
      setSaveError(errorText(deleteError));
    }
  }

  const back = { label: 'All events', onPress: () => navigation.goBack() };

  if (!data) {
    return (
      <Screen back={back}>
        {error ? <ErrorText>{error}</ErrorText> : <Note>Loading event…</Note>}
      </Screen>
    );
  }

  const { event } = data;
  const open = data.requirements.filter((row) => row.status !== 'done');
  const categories = [...new Set(open.map((row) => row.category).filter(Boolean))] as string[];
  const shoppingTotal = data.shopping.reduce((sum, row) => sum + Number(row.price ?? 0), 0);
  const when = [fullDate(event.event_date), shortTime(event.start_time)].filter(Boolean).join(' · ');

  const links = [
    access('guests') !== 'none' && {
      title: 'Guests',
      sub: `${event.expected_guests ?? 0} expected · ${data.confirmed} confirmed`,
      go: () => navigation.navigate('Guests', { screen: 'GuestsList', params: { eventId } }),
    },
    access('requirements') !== 'none' && {
      title: 'Requirements',
      sub:
        data.requirements.length === 0
          ? 'Nothing added yet'
          : [categories.slice(0, 2).join(', '), `${open.length} still needed`].filter(Boolean).join(' · '),
      go: () => navigation.navigate('Requirements', { screen: 'RequirementsList', params: { eventId } }),
    },
    access('shopping') !== 'none' && {
      title: 'Shopping',
      sub: `${plural(data.shopping.length, 'item', 'items')} · ${rupees(shoppingTotal)}`,
      go: () => navigation.navigate('Shopping', { screen: 'ShoppingList', params: { eventId } }),
    },
  ].filter(Boolean) as { title: string; sub: string; go: () => void }[];

  return (
    <Screen back={back} gap={20}>
      <View style={styles.head}>
        <Text style={styles.title}>{event.name}</Text>
        <Text style={styles.line}>{when}</Text>
        {event.dress_code ? <Text style={styles.line}>{`Dress code: ${event.dress_code}`}</Text> : null}
        {event.notes ? <Text style={styles.line}>{event.notes}</Text> : null}
      </View>
      <ErrorText>{error}</ErrorText>

      <Card>
        <View style={[styles.section, links.length > 0 && styles.divider]}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          {data.schedule.length === 0 ? <Text style={styles.sub}>Nothing planned yet.</Text> : null}
          {data.schedule.map((item) => (
            <View key={item.id} style={styles.slot}>
              <Text style={styles.slotTime}>{timeLabel(item.start_time)}</Text>
              <View style={styles.flex}>
                <Text style={styles.slotText}>{item.activity}</Text>
                {item.who ? <Text style={styles.sub}>{item.who}</Text> : null}
              </View>
              {canEdit ? (
                <IconButton label={`Remove ${item.activity}`} onPress={() => removeTime(item.id)}>
                  <Icon name="trash" color={colors.maroon} size={17} />
                </IconButton>
              ) : null}
            </View>
          ))}
          {adding ? (
            <View style={styles.form}>
              <Label right={timeLabel(time)}>Time</Label>
              <TimePicker value={time} onChange={setTime} />
              <Field small label="What happens" placeholder="e.g. Haldi ceremony starts" value={activity} onChangeText={setActivity} />
              <Field small label="Who" hint="Optional" placeholder="e.g. Priest, family" value={who} onChangeText={setWho} />
              <ErrorText>{saveError}</ErrorText>
              <View style={styles.formButtons}>
                <View style={styles.flex}>
                  <SecondaryButton label="Cancel" onPress={() => setAdding(false)} disabled={saving} />
                </View>
                <AddButton label={saving ? 'Saving…' : 'Save time'} onPress={addTime} disabled={saving} />
              </View>
            </View>
          ) : canEdit ? (
            <>
              <ErrorText>{saveError}</ErrorText>
              <LinkButton label="+ Add a time" onPress={() => setAdding(true)} />
            </>
          ) : null}
        </View>
        {links.map((link, index) => (
          <Pressable
            key={link.title}
            style={[styles.link, index < links.length - 1 && styles.divider]}
            onPress={link.go}
          >
            <View style={styles.flex}>
              <Text style={styles.sectionTitle}>{link.title}</Text>
              <Text style={styles.sub}>{link.sub}</Text>
            </View>
            <Chevron direction="right" color={colors.muted} />
          </Pressable>
        ))}
      </Card>

      <EventPhotos eventId={event.id} />

      {canEdit ? (
        <SecondaryButton label="Edit event" onPress={() => navigation.navigate('EditEvent', { eventId })} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: 6 },
  title: { fontFamily: fonts.extrabold, fontSize: 32, letterSpacing: -0.5, color: colors.ink },
  line: { fontFamily: fonts.medium, fontSize: 16, color: colors.brownInk },
  section: { padding: 16, gap: 6 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.tintSand },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  sub: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  slotTime: { width: 72, fontFamily: fonts.bold, fontSize: 14, color: colors.maroon },
  slotText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  flex: { flex: 1, gap: 4 },
  form: { gap: 10, marginTop: 6 },
  formButtons: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  link: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
});
