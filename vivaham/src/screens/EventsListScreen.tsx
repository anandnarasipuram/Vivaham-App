import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import BackPill from '../components/BackPill';
import Chevron from '../components/Chevron';
import TopStrip from '../components/TopStrip';
import { dayOfMonth, monthShort, shortTime, weekday } from '../lib/format';
import { supabase } from '../lib/supabase';
import { colors, fonts } from '../theme';

type EventRow = {
  id: string;
  name: string;
  event_date: string;
  start_time: string | null;
  expected_guests: number | null;
};

type Nav = { navigate: (screen: string, params?: object) => void };

function subtitle(event: EventRow) {
  const parts = [weekday(event.event_date), shortTime(event.start_time)];
  if (event.expected_guests) {
    parts.push(`${event.expected_guests} guests`);
  }
  return parts.filter(Boolean).join(' · ');
}

export default function EventsListScreen() {
  const navigation = useNavigation<Nav>();
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      supabase
        .from('events')
        .select('id, name, event_date, start_time, expected_guests')
        .order('event_date')
        .order('start_time')
        .then(({ data, error: loadError }) => {
          if (!active) {
            return;
          }
          if (loadError) {
            setError(loadError.message);
          } else {
            setEvents((data ?? []) as EventRow[]);
          }
        });
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={styles.screen}>
      <TopStrip />
      <ScrollView contentContainerStyle={styles.content}>
        <BackPill label="Home" onPress={() => navigation.navigate('Home')} />
        <Text style={styles.title}>Events</Text>

        {error ? <Text style={styles.note}>{error}</Text> : null}
        {!error && events === null ? <Text style={styles.note}>Loading events…</Text> : null}
        {events && events.length === 0 ? (
          <Text style={styles.note}>No events yet. Adding events comes in the next step.</Text>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingTop: 12, paddingHorizontal: 20, paddingBottom: 32, gap: 18 },
  title: { fontFamily: fonts.extrabold, fontSize: 28, letterSpacing: -0.5, color: colors.ink },
  note: { fontFamily: fonts.medium, fontSize: 15, color: colors.muted },
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
