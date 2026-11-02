import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import Calendar from '../components/Calendar';
import Field from '../components/Field';
import Screen from '../components/Screen';
import Stepper from '../components/Stepper';
import { ErrorText, Label, Note, Title } from '../components/ui';
import { errorText, one, run } from '../lib/data';
import { dayDate } from '../lib/format';
import { Vehicle } from '../lib/messages';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { useNav, useParams } from '../navigation/nav';
import { colors, fonts } from '../theme';

export default function VehicleFormScreen() {
  const navigation = useNav();
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const { wedding, access } = useWedding();
  const [loaded, setLoaded] = useState(!vehicleId);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [seats, setSeats] = useState(4);
  const [driver, setDriver] = useState('');
  const [phone, setPhone] = useState('');
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!vehicleId) {
      return;
    }
    one<Vehicle>(
      supabase
        .from('vehicles')
        .select('id, vehicle_name, vehicle_number, seats, driver_name, driver_phone, available_from, available_to, notes')
        .eq('id', vehicleId)
        .single()
    )
      .then((vehicle) => {
        setName(vehicle.vehicle_name);
        setNumber(vehicle.vehicle_number ?? '');
        setSeats(vehicle.seats ?? 4);
        setDriver(vehicle.driver_name ?? '');
        setPhone(vehicle.driver_phone ?? '');
        setFrom(vehicle.available_from?.slice(0, 10) ?? null);
        setTo(vehicle.available_to?.slice(0, 10) ?? null);
        setNotes(vehicle.notes ?? '');
        setLoaded(true);
      })
      .catch((loadError) => setError(errorText(loadError)));
  }, [vehicleId]);

  async function save() {
    if (!wedding) {
      return;
    }
    if (!name.trim()) {
      setError('Write the vehicle, for example Innova.');
      return;
    }
    setSaving(true);
    setError('');
    const fields = {
      vehicle_name: name.trim(),
      vehicle_number: number.trim().toUpperCase() || null,
      seats,
      driver_name: driver.trim() || null,
      driver_phone: phone.trim() || null,
      available_from: from,
      available_to: to ?? from,
      notes: notes.trim() || null,
    };
    try {
      if (vehicleId) {
        await run(supabase.from('vehicles').update(fields).eq('id', vehicleId));
      } else {
        await run(supabase.from('vehicles').insert({ ...fields, wedding_id: wedding.id }));
      }
      navigation.goBack();
    } catch (saveError) {
      setError(errorText(saveError));
      setSaving(false);
    }
  }

  const back = { label: 'Cancel', onPress: () => navigation.goBack() };

  if (access('transport') !== 'edit') {
    return (
      <Screen back={back}>
        <Note>You can view vehicles but not change them.</Note>
      </Screen>
    );
  }

  if (!loaded) {
    return (
      <Screen back={back}>{error ? <ErrorText>{error}</ErrorText> : <Note>Loading vehicle…</Note>}</Screen>
    );
  }

  const rangeLabel = from ? (to && to !== from ? `${dayDate(from)} → ${dayDate(to)}` : dayDate(from)) : 'Optional';

  return (
    <Screen back={back} gap={22}>
      <Title>{vehicleId ? 'Edit vehicle' : 'Add a vehicle'}</Title>
      <Field label="Vehicle" placeholder="e.g. Innova, Tempo Traveller" value={name} onChangeText={setName} />
      <Field
        label="Vehicle number"
        hint="Optional"
        placeholder="e.g. AP 09 AB 1234"
        autoCapitalize="characters"
        value={number}
        onChangeText={setNumber}
      />
      <View style={styles.between}>
        <Label>Seats</Label>
        <Stepper name="seats" value={seats} min={1} max={60} onChange={setSeats} />
      </View>
      <Field label="Driver name" hint="Optional" placeholder="e.g. Ravi" autoCapitalize="words" value={driver} onChangeText={setDriver} />
      <Field
        label="Driver phone"
        hint="Optional"
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <View style={styles.group}>
        <Label right={rangeLabel}>Available dates</Label>
        <Text style={styles.hint}>Tap the first day, then the last day. Tap one day only if it is a single day.</Text>
        <Calendar
          rangeStart={from}
          rangeEnd={to}
          initialMonth={wedding?.weddingDate}
          onRangeChange={(start, end) => {
            setFrom(start);
            setTo(end);
          }}
        />
      </View>
      <Field
        label="Notes"
        hint="Optional"
        multiline
        placeholder="e.g. AC, picks up from the railway station"
        value={notes}
        onChangeText={setNotes}
      />
      <ErrorText>{error}</ErrorText>
      <PrimaryButton label={saving ? 'Saving…' : vehicleId ? 'Save changes' : 'Save vehicle'} onPress={save} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
});
