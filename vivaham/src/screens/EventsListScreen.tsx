import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import Chevron from '../components/Chevron';
import Screen from '../components/Screen';
import { EmptyBox, ErrorText, Note, Title } from '../components/ui';
import { EventRow, fetchEvents, useFocusData } from '../lib/data';
import { dayOfMonth, monthShort, shortTime, weekday } from '../lib/format';
import { useWedding } from '../lib/wedding';
import { goHome, useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';

function subtitle(event: EventRow) {
  const parts = [weekday(event.event_date), shortTime(event.start_time)];
  if (event.expected_guests) {
    parts.push(`${event.expected_guests} guests`);
  }
  return parts.filter(Boolean).join(' · ');
}

export default function EventsListScreen() {
  const navigation = useNav();
  const { access } = useWedding();
  const canSee = access('events') !== 'none';
  const canEdit = access('events') === 'edit';
  const { data: events, error } = useFocusData(() => (canSee ? fetchEvents() : Promise.resolve([])), [canSee]);

  return (
    <Screen back={{ label: 'Home', onPress: () => goHome(navigation) }}>
      <Title>Events</Title>
      {!canSee ? <Note>You don’t have access to Events.</Note> : null}
      <ErrorText>{error}</ErrorText>
      {canSee && !error && events === null ? <Note>Loading events…</Note> : null}
      {events && events.length === 0 && canSee ? (
        <EmptyBox>
          {canEdit ? 'No events yet. Tap “+ Add an event” to add the first one.' : 'No events yet.'}
        </EmptyBox>
      ) : null}

      <View style={styles.list}>
        {(events ?? []).map((event) => (
          <Pressable
            key={event.id}
            style={styles.card}
            onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
          >
            <View style={styles.dateBox}>
              <Text style={styles.month}>{monthShort(event.event_date)}</Text>
              <Text style={styles.day}>{dayOfMonth(event.event_date)}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.name}>{event.name}</Text>
              <Text style={styles.sub}>{subtitle(event)}</Text>
            </View>
            <Chevron direction="right" color={colors.muted} />
          </Pressable>
        ))}
      </View>

      {canEdit ? (
        <PrimaryButton size="medium" label="+ Add an event" onPress={() => navigation.navigate('AddEvent')} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  dateBox: {
    width: 56,
    height: 60,
    borderRadius: 14,
    backgroundColor: colors.tintGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: { fontFamily: fonts.bold, fontSize: 12, color: colors.goldInk },
  day: { fontFamily: fonts.extrabold, fontSize: 22, lineHeight: 24, color: colors.goldInk },
  cardText: { flex: 1, gap: 4 },
  name: { fontFamily: fonts.bold, fontSize: 18, color: colors.ink },
  sub: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
});
