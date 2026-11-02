import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon, { IconName } from '../components/Icon';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { colors, fonts } from '../theme';

type Summary = {
  events: number;
  guests: number;
  toBuy: number;
  needed: number;
  committed: number;
  meals: number;
  rooms: number;
  places: number;
  tasksLeft: number;
};

type Tile = {
  module: string;
  route: string;
  title: string;
  subtitle: string;
  icon: IconName;
  tint: string;
  ink: string;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function dateLabel(iso: string) {
  const date = parseDate(iso);
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function countdown(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((parseDate(iso).getTime() - today.getTime()) / 86400000);
  if (days > 1) {
    return { value: String(days), caption: 'days to go' };
  }
  if (days === 1) {
    return { value: '1', caption: 'day to go' };
  }
  if (days === 0) {
    return { value: '0', caption: 'Today is the big day!' };
  }
  return { value: String(Math.abs(days)), caption: 'days since the wedding' };
}

function rupees(amount: number) {
  const digits = Math.round(amount).toString();
  if (digits.length <= 3) {
    return `₹${digits}`;
  }
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${rest},${lastThree}`;
}

async function loadSummary(can: (module: string) => boolean): Promise<Summary> {
  const [events, guests, shopping, requirements, expenses, meals, stays, tasks] = await Promise.all([
    can('events') ? supabase.from('events').select('id', { count: 'exact', head: true }) : null,
    can('guests') ? supabase.from('guests').select('id', { count: 'exact', head: true }) : null,
    can('shopping') ? supabase.from('shopping_items').select('price, status') : null,
    can('requirements') ? supabase.from('requirements').select('status') : null,
    can('budget') ? supabase.from('expenses').select('amount') : null,
    can('food') ? supabase.from('meals').select('id', { count: 'exact', head: true }) : null,
    can('stays') ? supabase.from('accommodations').select('rooms') : null,
    can('todo') ? supabase.from('tasks').select('status') : null,
  ]);

  const shoppingRows = (shopping?.data ?? []) as { price: number; status: string }[];
  const requirementRows = (requirements?.data ?? []) as { status: string }[];
  const expenseRows = (expenses?.data ?? []) as { amount: number }[];
  const stayRows = (stays?.data ?? []) as { rooms: number | null }[];
  const taskRows = (tasks?.data ?? []) as { status: string }[];

  const shoppingTotal = shoppingRows.reduce((sum, row) => sum + Number(row.price), 0);
  const expenseTotal = expenseRows.reduce((sum, row) => sum + Number(row.amount), 0);

  return {
    events: events?.count ?? 0,
    guests: guests?.count ?? 0,
    toBuy: shoppingRows.filter((row) => row.status !== 'bought').length,
    needed: requirementRows.filter((row) => row.status !== 'done').length,
    committed: shoppingTotal + expenseTotal,
    meals: meals?.count ?? 0,
    rooms: stayRows.reduce((sum, row) => sum + (row.rooms ?? 0), 0),
    places: stayRows.length,
    tasksLeft: taskRows.filter((row) => row.status !== 'done').length,
  };
}

export default function HomeScreen() {
  const { wedding, loading, error, access } = useWedding();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const [summary, setSummary] = useState<Summary | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadSummary((module) => access(module) !== 'none').then((result) => {
        if (active) {
          setSummary(result);
        }
      });
      return () => {
        active = false;
      };
    }, [access])
  );

  const strip = <View style={[styles.strip, { height: insets.top + 14 }]} />;

  if (loading) {
    return (
      <View style={styles.screen}>
        {strip}
        <Text style={styles.message}>Loading your wedding…</Text>
      </View>
    );
  }

  if (error || !wedding) {
    return (
      <View style={styles.screen}>
        {strip}
        <Text style={styles.message}>{error || 'You are not part of a wedding yet.'}</Text>
        <Pressable style={styles.logout} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    );
  }

  const s = summary;
  const dash = '…';
  const count = wedding.weddingDate ? countdown(wedding.weddingDate) : null;
  const canSeeShopping = access('shopping') !== 'none';

  const allTiles: Tile[] = [
    { module: 'events', route: 'Events', title: 'Events', subtitle: s ? `${s.events} planned` : dash, icon: 'calendar', tint: colors.tintGold, ink: colors.goldInk },
    { module: 'guests', route: 'Guests', title: 'Guests', subtitle: s ? `${s.guests} invited` : dash, icon: 'guests', tint: colors.tintGreen, ink: colors.green },
    { module: 'shopping', route: 'Shopping', title: 'Shopping', subtitle: s ? `${s.toBuy} to buy` : dash, icon: 'bag', tint: colors.tintRose, ink: colors.maroon },
    { module: 'requirements', route: 'Requirements', title: 'Requirements', subtitle: s ? `${s.needed} still needed` : dash, icon: 'diya', tint: colors.tintGold, ink: colors.goldInk },
    {
      module: 'budget',
      route: 'Budget',
      title: 'Budget',
      subtitle: s ? (canSeeShopping ? `${rupees(s.committed)} committed` : 'Open budget') : dash,
      icon: 'wallet',
      tint: colors.tintGreen,
      ink: colors.green,
    },
    { module: 'food', route: 'Food', title: 'Food', subtitle: s ? `${s.meals} ${s.meals === 1 ? 'meal' : 'meals'} planned` : dash, icon: 'bowl', tint: colors.tintRose, ink: colors.maroon },
    { module: 'stays', route: 'Stays', title: 'Stays', subtitle: s ? `${s.rooms} rooms · ${s.places} ${s.places === 1 ? 'place' : 'places'}` : dash, icon: 'stays', tint: colors.tintGreen, ink: colors.green },
    { module: 'todo', route: 'Todo', title: 'To-do', subtitle: s ? `${s.tasksLeft} tasks left` : dash, icon: 'check', tint: colors.tintSand, ink: colors.brownInk },
  ];
  const tiles = allTiles.filter((tile) => access(tile.module) !== 'none');

  return (
    <View style={styles.screen}>
      {strip}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleBlock}>
          <Text style={styles.tag}>ॐ · VIVAHAM</Text>
          <Text style={styles.title}>{wedding.name}</Text>
        </View>

        {count && wedding.weddingDate ? (
          <View style={styles.countCard}>
            <View style={styles.countRow}>
              <Text style={styles.countValue}>{count.value}</Text>
              <Text style={styles.countCaption}>{count.caption}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.dateRow}>
              <View style={styles.dateIcon}>
                <Icon name="calendar" color={colors.maroon} size={20} />
              </View>
              <View style={styles.dateText}>
                <Text style={styles.dateLabel}>Main wedding day</Text>
                <Text style={styles.dateValue}>{dateLabel(wedding.weddingDate)}</Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What do you want to do?</Text>
          <View style={styles.grid}>
            {tiles.map((tile) => (
              <Pressable
                key={tile.module}
                style={styles.tile}
                onPress={() => navigation.navigate(tile.route)}
              >
                <View style={[styles.tileIcon, { backgroundColor: tile.tint }]}>
                  <Icon name={tile.icon} color={tile.ink} size={22} />
                </View>
                <View style={styles.tileText}>
                  <Text style={styles.tileTitle}>{tile.title}</Text>
                  <Text style={styles.tileSubtitle}>{tile.subtitle}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.logout} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  strip: { backgroundColor: colors.maroon, borderBottomWidth: 2, borderBottomColor: colors.gold },
  content: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 32, gap: 20 },
  message: { fontFamily: fonts.semibold, fontSize: 16, color: colors.muted, padding: 20 },
  titleBlock: { gap: 4 },
  tag: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2, color: colors.goldDark },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.ink },
  countCard: {
    backgroundColor: colors.maroon,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  countRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' },
  countValue: { fontFamily: fonts.heading, fontSize: 52, lineHeight: 56, color: colors.white },
  countCaption: { fontFamily: fonts.bold, fontSize: 17, color: colors.goldLight },
  divider: { height: 1, backgroundColor: colors.gold },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: { gap: 2 },
  dateLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.goldLight },
  dateValue: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.white },
  section: { gap: 10 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 19, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 72,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { flex: 1 },
  tileTitle: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.ink },
  tileSubtitle: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: colors.muted },
  logout: { alignSelf: 'center', minHeight: 44, justifyContent: 'center' },
  logoutText: { fontFamily: fonts.bold, fontSize: 15, color: colors.maroon },
});
