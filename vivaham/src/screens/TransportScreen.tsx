import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { IconButton, PrimaryButton, SecondaryButton } from '../components/Buttons';
import { ConfirmDialog } from '../components/Dialog';
import Icon from '../components/Icon';
import Screen from '../components/Screen';
import { Badge, Card, EmptyBox, ErrorText, Note, Title } from '../components/ui';
import { errorText, rows, run, useFocusData } from '../lib/data';
import { plural } from '../lib/format';
import { fill, openWhatsApp, TRANSPORT_GROUP_MESSAGE, Vehicle, vehicleDates, vehicleLines } from '../lib/messages';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { goHome, useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';

export function fetchVehicles() {
  return rows<Vehicle>(
    supabase
      .from('vehicles')
      .select('id, vehicle_name, vehicle_number, seats, driver_name, driver_phone, available_from, available_to, notes')
      .order('available_from')
      .order('created_at')
  );
}

export default function TransportScreen() {
  const navigation = useNav();
  const { wedding, access } = useWedding();
  const canSee = access('transport') !== 'none';
  const canEdit = access('transport') === 'edit';
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const { data: vehicles, error, reload } = useFocusData(
    () => (canSee ? fetchVehicles() : Promise.resolve([] as Vehicle[])),
    [canSee]
  );

  async function remove() {
    if (!deleting) {
      return;
    }
    setBusy(true);
    setActionError('');
    try {
      await run(supabase.from('vehicles').delete().eq('id', deleting.id));
      setDeleting(null);
      await reload();
    } catch (failure) {
      setActionError(errorText(failure));
    }
    setBusy(false);
  }

  async function share() {
    setActionError('');
    try {
      await openWhatsApp(
        fill(TRANSPORT_GROUP_MESSAGE, { wedding: wedding?.name ?? 'the wedding', vehicles: vehicleLines(vehicles ?? []) })
      );
    } catch (failure) {
      setActionError(errorText(failure));
    }
  }

  const back = { label: 'Home', onPress: () => goHome(navigation) };

  if (!canSee) {
    return (
      <Screen back={back}>
        <Title>Transport</Title>
        <Note>You don’t have access to Transport.</Note>
      </Screen>
    );
  }

  return (
    <Screen back={back}>
      <View style={styles.titleRow}>
        <Title>Transport</Title>
        {canEdit ? (
          <PrimaryButton size="small" label="+ Add a vehicle" onPress={() => navigation.navigate('VehicleForm')} />
        ) : null}
      </View>
      <ErrorText>{error || actionError}</ErrorText>
      {vehicles === null && !error ? <Note>Loading vehicles…</Note> : null}
      {vehicles && vehicles.length === 0 ? (
        <EmptyBox>
          {canEdit ? 'No vehicles yet. Tap “+ Add a vehicle” to add the first one.' : 'No vehicles yet.'}
        </EmptyBox>
      ) : null}

      {(vehicles ?? []).map((vehicle) => (
        <Card key={vehicle.id} style={styles.card}>
          <View style={styles.head}>
            <View style={styles.iconBox}>
              <Icon name="car" color={colors.goldInk} size={22} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.name}>{vehicle.vehicle_name}</Text>
              {vehicle.vehicle_number ? <Text style={styles.small}>{vehicle.vehicle_number}</Text> : null}
            </View>
            {vehicle.seats ? <Badge tone="gold" label={plural(vehicle.seats, 'seat', 'seats')} /> : null}
          </View>
          {vehicle.driver_name || vehicle.driver_phone ? (
            <View style={styles.driver}>
              <Text style={styles.label}>{`Driver: ${vehicle.driver_name ?? 'not set'}`}</Text>
              {vehicle.driver_phone ? (
                <Pressable
                  accessibilityRole="link"
                  style={styles.call}
                  onPress={() => Linking.openURL(`tel:${vehicle.driver_phone?.replace(/\s/g, '')}`)}
                >
                  <Icon name="phone" color={colors.maroon} size={16} />
                  <Text style={styles.callText}>{vehicle.driver_phone}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {vehicleDates(vehicle) ? (
            <View style={styles.dates}>
              <Text style={styles.dateLabel}>Available</Text>
              <Text style={styles.dateValue}>{vehicleDates(vehicle)}</Text>
            </View>
          ) : null}
          {vehicle.notes ? <Text style={styles.notes}>{vehicle.notes}</Text> : null}
          {canEdit ? (
            <View style={styles.actions}>
              <View style={styles.flex}>
                <SecondaryButton
                  label="Edit vehicle"
                  onPress={() => navigation.navigate('VehicleForm', { vehicleId: vehicle.id })}
                />
              </View>
              <IconButton label={`Delete ${vehicle.vehicle_name}`} onPress={() => setDeleting(vehicle)}>
                <Icon name="trash" color={colors.maroon} size={18} />
              </IconButton>
            </View>
          ) : null}
        </Card>
      ))}

      {vehicles && vehicles.length > 0 ? (
        <PrimaryButton
          size="medium"
          color={colors.whatsapp}
          icon={<Icon name="chat" color={colors.white} size={20} />}
          label="Share on WhatsApp"
          onPress={share}
        />
      ) : null}

      <ConfirmDialog
        visible={deleting !== null}
        title="Delete this vehicle?"
        message={deleting ? `${deleting.vehicle_name} will be removed from the transport list.` : ''}
        busy={busy}
        error={actionError}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  card: { borderRadius: 18, padding: 16, gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.tintGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.ink },
  small: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted, letterSpacing: 0.5 },
  driver: { gap: 2 },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  call: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, alignSelf: 'flex-start' },
  callText: { fontFamily: fonts.bold, fontSize: 15, color: colors.maroon },
  dates: { backgroundColor: colors.cream, borderRadius: 12, padding: 12, gap: 2 },
  dateLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted },
  dateValue: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  notes: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.brownInk },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
