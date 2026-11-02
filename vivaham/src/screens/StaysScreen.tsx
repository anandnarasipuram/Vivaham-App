import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { IconButton, PrimaryButton, SecondaryButton } from '../components/Buttons';
import { ConfirmDialog, Dialog } from '../components/Dialog';
import Icon from '../components/Icon';
import Screen from '../components/Screen';
import SelectRow from '../components/SelectRow';
import Stepper from '../components/Stepper';
import { Avatar, Badge, Card, EmptyBox, ErrorText, Note, Title } from '../components/ui';
import { errorText, rows, run, useFocusData } from '../lib/data';
import { dayDate, initial, plural } from '../lib/format';
import { fetchGuestOptions, GuestOption, mapsLink, stayNights, stayWhen } from '../lib/stays';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { goHome, useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';

type Stay = {
  id: string;
  name: string;
  address: string | null;
  maps_url: string | null;
  rooms: number | null;
  checkin_date: string | null;
  checkin_time: string | null;
  checkout_date: string | null;
  checkout_time: string | null;
  contact_name: string | null;
  contact_phone: string | null;
};

type Placement = { id: string; accommodation_id: string; guest_id: string; people: number | null };

function nights(stay: Stay) {
  return stayNights(stay.checkin_date, stay.checkout_date);
}

export default function StaysScreen() {
  const navigation = useNav();
  const { wedding, access } = useWedding();
  const canSee = access('stays') !== 'none';
  const canEdit = access('stays') === 'edit';
  const canSeeGuests = access('guests') !== 'none';
  const [actionError, setActionError] = useState('');
  const [sharing, setSharing] = useState<Stay | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [deleting, setDeleting] = useState<Stay | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, error, reload } = useFocusData(async () => {
    if (!canSee) {
      return { stays: [] as Stay[], placements: [] as Placement[], guests: [] as GuestOption[] };
    }
    const [stays, placements, guests] = await Promise.all([
      rows<Stay>(
        supabase
          .from('accommodations')
          .select(
            'id, name, address, maps_url, rooms, checkin_date, checkin_time, checkout_date, checkout_time, contact_name, contact_phone'
          )
          .order('checkin_date')
          .order('created_at')
      ),
      rows<Placement>(supabase.from('accommodation_guests').select('id, accommodation_id, guest_id, people').order('created_at')),
      canSeeGuests ? fetchGuestOptions() : Promise.resolve([]),
    ]);
    return { stays, placements, guests };
  }, [canSee, canSeeGuests]);

  async function act(action: () => Promise<void>) {
    setActionError('');
    setBusy(true);
    try {
      await action();
      await reload();
    } catch (failure) {
      setActionError(errorText(failure));
    }
    setBusy(false);
  }

  function openShare(stay: Stay) {
    setContactName(stay.contact_name ?? '');
    setContactPhone(stay.contact_phone ?? '');
    setSharing(stay);
  }

  function shareTop(stay: Stay) {
    return [
      `Stay for ${wedding?.name ?? 'the wedding'}`,
      stay.name,
      stay.address,
      `Check-in: ${stayWhen(stay.checkin_date, stay.checkin_time)}`,
      `Check-out: ${stayWhen(stay.checkout_date, stay.checkout_time)}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  async function sendShare() {
    if (!sharing) {
      return;
    }
    const stay = sharing;
    const message = [
      shareTop(stay),
      contactName.trim() ? `Contact person: ${contactName.trim()}` : '',
      contactPhone.trim() ? `Contact number: ${contactPhone.trim()}` : '',
      `Map: ${mapsLink(stay.maps_url, stay.address, stay.name)}`,
    ]
      .filter(Boolean)
      .join('\n');
    setBusy(true);
    setActionError('');
    try {
      if (canEdit && (contactName.trim() !== (stay.contact_name ?? '') || contactPhone.trim() !== (stay.contact_phone ?? ''))) {
        await run(
          supabase
            .from('accommodations')
            .update({ contact_name: contactName.trim() || null, contact_phone: contactPhone.trim() || null })
            .eq('id', stay.id)
        );
      }
      await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
      setSharing(null);
      await reload();
    } catch (failure) {
      setActionError(errorText(failure));
    }
    setBusy(false);
  }

  async function deleteStay() {
    if (!deleting) {
      return;
    }
    setBusy(true);
    setActionError('');
    try {
      await run(supabase.from('accommodation_guests').delete().eq('accommodation_id', deleting.id));
      await run(supabase.from('accommodations').delete().eq('id', deleting.id));
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
        <Title>Accommodation</Title>
        <Note>You don’t have access to Stays.</Note>
      </Screen>
    );
  }

  const stays = data?.stays ?? [];
  const placements = data?.placements ?? [];
  const guestsById = new Map((data?.guests ?? []).map((guest) => [guest.id, guest]));
  const placedIds = new Set(placements.map((placement) => placement.guest_id));
  const unplaced = (data?.guests ?? []).filter((guest) => !placedIds.has(guest.id));
  const starts = stays.map((stay) => stay.checkin_date).filter(Boolean).sort() as string[];
  const ends = stays.map((stay) => stay.checkout_date).filter(Boolean).sort() as string[];

  return (
    <Screen back={back}>
      <View style={styles.titleRow}>
        <Title>Accommodation</Title>
        {canEdit ? <PrimaryButton size="small" label="+ Add a stay" onPress={() => navigation.navigate('AddStay')} /> : null}
      </View>
      <ErrorText>{error || actionError}</ErrorText>
      {!data && !error ? <Note>Loading stays…</Note> : null}

      {data ? (
        <View style={styles.summary}>
          <Summary value={stays.reduce((sum, stay) => sum + (stay.rooms ?? 0), 0)} label="rooms" />
          <Summary value={stays.length} label="places" />
          <Summary value={stays.reduce((sum, stay) => sum + nights(stay), 0)} label="nights" />
          <Summary value={placements.reduce((sum, row) => sum + (row.people ?? 1), 0)} label="guests" />
        </View>
      ) : null}
      {starts.length > 0 && ends.length > 0 ? (
        <Text style={styles.range}>{`From ${dayDate(starts[0])} to ${dayDate(ends[ends.length - 1])}`}</Text>
      ) : null}
      {data && stays.length === 0 ? <EmptyBox>No stays yet. Tap “+ Add a stay” to add the first place.</EmptyBox> : null}

      {stays.map((stay) => {
        const here = placements.filter((placement) => placement.accommodation_id === stay.id);
        const count = nights(stay);
        return (
          <Card key={stay.id} style={styles.stay}>
            <View style={styles.stayHead}>
              <View style={styles.stayIcon}>
                <Icon name="stays" color={colors.goldInk} size={22} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.stayName}>{stay.name}</Text>
                {stay.address ? (
                  <Text style={styles.small} numberOfLines={1}>
                    {stay.address.split(',')[0]}
                  </Text>
                ) : null}
              </View>
              {count > 0 ? <Badge label={plural(count, 'night', 'nights')} /> : null}
            </View>
            <View style={styles.dates}>
              <View style={styles.flex}>
                <Text style={styles.dateLabel}>Check-in</Text>
                <Text style={styles.dateValue}>{stayWhen(stay.checkin_date, stay.checkin_time)}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.dateLabel}>Check-out</Text>
                <Text style={styles.dateValue}>{stayWhen(stay.checkout_date, stay.checkout_time)}</Text>
              </View>
            </View>
            <View style={styles.between}>
              <Text style={styles.label}>Rooms booked</Text>
              {canEdit ? (
                <Stepper
                  compact
                  name={`rooms at ${stay.name}`}
                  value={stay.rooms ?? 0}
                  disabled={busy}
                  onChange={(rooms) => act(() => run(supabase.from('accommodations').update({ rooms }).eq('id', stay.id)))}
                />
              ) : (
                <Text style={styles.label}>{stay.rooms ?? 0}</Text>
              )}
            </View>
            <View style={styles.address}>
              <Icon name="pin" color={colors.maroon} size={20} />
              <View style={styles.flex}>
                {stay.address ? <Text style={styles.addressText}>{stay.address}</Text> : null}
                <Pressable
                  style={styles.mapLink}
                  onPress={() => Linking.openURL(mapsLink(stay.maps_url, stay.address, stay.name))}
                >
                  <Text style={styles.mapText}>Open in Maps</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.guestBlock}>
              <Text style={styles.label}>{`Guests staying here (${here.length})`}</Text>
              <View style={styles.guestList}>
                {here.map((placement) => {
                  const guest = guestsById.get(placement.guest_id);
                  const guestName = guest?.name ?? 'Guest';
                  return (
                    <View key={placement.id} style={styles.guestRow}>
                      <Avatar label={initial(guestName)} size={32} tone="green" />
                      <Text style={styles.guestName}>
                        {guestName}
                        {(placement.people ?? 1) > 1 ? <Text style={styles.small}>{` · ${placement.people} people`}</Text> : null}
                      </Text>
                      {canEdit ? (
                        <IconButton
                          label={`Remove ${guestName} from ${stay.name}`}
                          onPress={() =>
                            act(() => run(supabase.from('accommodation_guests').delete().eq('id', placement.id)))
                          }
                        >
                          <Icon name="trash" color={colors.maroon} size={17} />
                        </IconButton>
                      ) : null}
                    </View>
                  );
                })}
                {here.length === 0 ? <Text style={[styles.small, styles.pad]}>Nobody placed here yet.</Text> : null}
                {canEdit && canSeeGuests ? (
                  <View style={styles.pad}>
                    {unplaced.length > 0 ? (
                      <SelectRow
                        title={`Add a guest to ${stay.name}`}
                        placeholder="+ Add a guest staying here"
                        options={unplaced.map((guest) => ({ key: guest.id, label: guest.name }))}
                        value={null}
                        onChange={(guestId) =>
                          act(() =>
                            run(
                              supabase.from('accommodation_guests').insert({
                                wedding_id: wedding?.id,
                                accommodation_id: stay.id,
                                guest_id: guestId,
                                people: guestsById.get(guestId)?.people ?? 1,
                              })
                            )
                          )
                        }
                      />
                    ) : (
                      <Text style={styles.small}>Everyone on the guest list already has a place to stay.</Text>
                    )}
                  </View>
                ) : null}
              </View>
            </View>
            <PrimaryButton
              size="medium"
              color={colors.whatsapp}
              icon={<Icon name="chat" color={colors.white} size={20} />}
              label="Share location on WhatsApp"
              onPress={() => openShare(stay)}
            />
            {canEdit ? (
              <SecondaryButton
                tone="maroon"
                icon={<Icon name="trash" color={colors.maroon} size={18} />}
                label="Delete this stay"
                onPress={() => setDeleting(stay)}
              />
            ) : null}
          </Card>
        );
      })}

      <Dialog visible={sharing !== null} title="Share on WhatsApp" onClose={() => setSharing(null)}>
        <Text style={styles.dialogText}>
          This message will open in WhatsApp. Pick the family group or a person to send it to.
        </Text>
        <Text style={styles.previewLabel}>Message preview · tap the contact lines to fill them in</Text>
        {sharing ? (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{shareTop(sharing)}</Text>
            <View style={styles.bubbleRow}>
              <Text style={styles.bubbleLabel}>Contact person:</Text>
              <TextInput
                style={styles.bubbleInput}
                placeholder="add name"
                placeholderTextColor={colors.placeholder}
                value={contactName}
                onChangeText={setContactName}
                editable={canEdit}
              />
            </View>
            <View style={styles.bubbleRow}>
              <Text style={styles.bubbleLabel}>Contact number:</Text>
              <TextInput
                style={styles.bubbleInput}
                placeholder="add number"
                placeholderTextColor={colors.placeholder}
                keyboardType="phone-pad"
                value={contactPhone}
                onChangeText={setContactPhone}
                editable={canEdit}
              />
            </View>
            <Text style={styles.bubbleText} numberOfLines={2}>
              {`Map: ${mapsLink(sharing.maps_url, sharing.address, sharing.name)}`}
            </Text>
          </View>
        ) : null}
        <ErrorText>{actionError}</ErrorText>
        <PrimaryButton size="medium" color={colors.whatsapp} label={busy ? 'Opening…' : 'Open WhatsApp'} onPress={sendShare} disabled={busy} />
        <SecondaryButton label="Cancel" onPress={() => setSharing(null)} disabled={busy} />
      </Dialog>

      <ConfirmDialog
        visible={deleting !== null}
        title="Delete this stay?"
        message={
          deleting
            ? `${deleting.name} will be deleted, and ${plural(
                placements.filter((placement) => placement.accommodation_id === deleting.id).length,
                'guest',
                'guests'
              )} placed there will no longer have a stay.`
            : ''
        }
        busy={busy}
        error={actionError}
        onConfirm={deleteStay}
        onCancel={() => setDeleting(null)}
      />
    </Screen>
  );
}

function Summary({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.maroon,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 2 },
  summaryValue: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.white },
  summaryLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.goldLight },
  range: { fontFamily: fonts.medium, fontSize: 14, color: colors.brownInk },
  stay: { borderRadius: 18, padding: 16, gap: 14 },
  stayHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stayIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.tintGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1, gap: 2 },
  stayName: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.ink },
  small: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  dates: { flexDirection: 'row', gap: 8, backgroundColor: colors.cream, borderRadius: 12, padding: 12 },
  dateLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted },
  dateValue: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  address: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  addressText: { fontFamily: fonts.medium, fontSize: 14, color: colors.brownInk },
  mapLink: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  mapText: { fontFamily: fonts.bold, fontSize: 14, color: colors.maroon },
  guestBlock: { gap: 8 },
  guestList: { borderWidth: 1, borderColor: colors.tintSand, borderRadius: 12 },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 52,
    paddingVertical: 4,
    paddingLeft: 12,
    paddingRight: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.tintSand,
  },
  guestName: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  pad: { padding: 8 },
  dialogText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.brownInk },
  previewLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted },
  bubble: {
    backgroundColor: colors.tintGreen,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 14,
    gap: 6,
  },
  bubbleText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, color: colors.ink },
  bubbleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bubbleLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  bubbleInput: {
    flex: 1,
    height: 40,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderBottomColor: colors.green,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingHorizontal: 8,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
  },
});
