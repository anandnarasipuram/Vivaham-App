import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { AddButton, IconButton, PrimaryButton, SecondaryButton } from '../components/Buttons';
import Calendar from '../components/Calendar';
import { Chip, ChipGroup, EditableChips } from '../components/Chips';
import { ConfirmDialog } from '../components/Dialog';
import Field, { Input } from '../components/Field';
import Icon from '../components/Icon';
import Screen from '../components/Screen';
import Stepper from '../components/Stepper';
import TimePicker from '../components/TimePicker';
import { Avatar, Card, EmptyBox, ErrorText, Label, Note, SectionRule, Title } from '../components/ui';
import { errorText, EventRow, one, rows, run } from '../lib/data';
import { fullDate, initial, plural, timeLabel } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { useNav, useParams } from '../navigation/nav';
import { colors, fonts } from '../theme';

const EVENT_NAMES = ['Engagement', 'Mehandi', 'Haldi', 'Sangeet', 'Wedding', 'Reception'];
const DECOR_IDEAS = ['Flower garlands', 'Mandap', 'Stage backdrop', 'Entrance arch', 'Rangoli', 'Lighting'];

type Vendor = { id?: string; name: string; role: string; phone: string };
type Decor = { id?: string; item: string };

export default function EventFormScreen() {
  const navigation = useNav();
  const { eventId } = useParams<{ eventId: string }>();
  const editing = Boolean(eventId);
  const { wedding, access } = useWedding();
  const canEdit = access('events') === 'edit';

  const [loaded, setLoaded] = useState(!editing);
  const [nameOptions, setNameOptions] = useState(EVENT_NAMES);
  const [name, setName] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState('10:00:00');
  const [hasDress, setHasDress] = useState(false);
  const [dress, setDress] = useState('');
  const [guests, setGuests] = useState(50);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [originalVendors, setOriginalVendors] = useState<string[]>([]);
  const [vendorName, setVendorName] = useState('');
  const [vendorRole, setVendorRole] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [decor, setDecor] = useState<Decor[]>([]);
  const [originalDecor, setOriginalDecor] = useState<string[]>([]);
  const [decorDraft, setDecorDraft] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!eventId) {
      return;
    }
    Promise.all([
      one<EventRow>(
        supabase
          .from('events')
          .select('id, name, event_date, start_time, expected_guests, dress_code, highlights, notes')
          .eq('id', eventId)
          .single()
      ),
      rows<Required<Vendor>>(
        supabase.from('event_vendors').select('id, name, role, phone').eq('event_id', eventId).order('created_at')
      ),
      rows<Required<Decor>>(
        supabase
          .from('requirements')
          .select('id, item')
          .eq('event_id', eventId)
          .eq('category', 'Decor')
          .order('created_at')
      ),
    ])
      .then(([event, vendorRows, decorRows]) => {
        setName(event.name);
        setNameOptions((options) => (options.includes(event.name) ? options : [...options, event.name]));
        setDate(event.event_date);
        setTime(event.start_time ?? '10:00:00');
        setHasDress(Boolean(event.dress_code));
        setDress(event.dress_code ?? '');
        setGuests(event.expected_guests ?? 0);
        setVendors(vendorRows.map((row) => ({ ...row, role: row.role ?? '', phone: row.phone ?? '' })));
        setOriginalVendors(vendorRows.map((row) => row.id));
        setDecor(decorRows);
        setOriginalDecor(decorRows.map((row) => row.id));
        setLoaded(true);
      })
      .catch((loadError) => setError(errorText(loadError)));
  }, [eventId]);

  function addVendor() {
    if (!vendorName.trim()) {
      return;
    }
    setVendors([...vendors, { name: vendorName.trim(), role: vendorRole.trim(), phone: vendorPhone.trim() }]);
    setVendorName('');
    setVendorRole('');
    setVendorPhone('');
  }

  function addDecor(item: string) {
    const clean = item.trim();
    if (!clean || decor.some((row) => row.item.toLowerCase() === clean.toLowerCase())) {
      return;
    }
    setDecor([...decor, { item: clean }]);
    setDecorDraft('');
  }

  async function save() {
    if (!wedding) {
      return;
    }
    if (!name) {
      setError('Choose the event or add your own.');
      return;
    }
    if (!date) {
      setError('Pick the date of the event.');
      return;
    }
    setSaving(true);
    setError('');
    const fields = {
      name,
      event_date: date,
      start_time: time,
      dress_code: hasDress && dress.trim() ? dress.trim() : null,
      expected_guests: guests,
    };
    try {
      let id = eventId ?? createdId;
      if (id) {
        await run(supabase.from('events').update(fields).eq('id', id));
      } else {
        const created = await one<{ id: string }>(
          supabase
            .from('events')
            .insert({ ...fields, wedding_id: wedding.id })
            .select('id')
            .single()
        );
        id = created.id;
        setCreatedId(id);
      }
      const keptVendors = vendors.filter((row) => row.id).map((row) => row.id);
      const removedVendors = originalVendors.filter((vendorId) => !keptVendors.includes(vendorId));
      const newVendors = vendors.filter((row) => !row.id);
      const canDecor = access('requirements') === 'edit';
      const keptDecor = decor.filter((row) => row.id).map((row) => row.id);
      const removedDecor = originalDecor.filter((decorId) => !keptDecor.includes(decorId));
      const newDecor = decor.filter((row) => !row.id);
      if (removedVendors.length > 0) {
        await run(supabase.from('event_vendors').delete().in('id', removedVendors));
      }
      if (newVendors.length > 0) {
        const saved = await rows<{ id: string }>(
          supabase
            .from('event_vendors')
            .insert(
              newVendors.map((row) => ({
                wedding_id: wedding.id,
                event_id: id,
                name: row.name,
                role: row.role || null,
                phone: row.phone || null,
              }))
            )
            .select('id')
        );
        const savedVendors = [
          ...vendors.filter((row) => row.id),
          ...newVendors.map((row, index) => ({ ...row, id: saved[index]?.id })),
        ];
        setVendors(savedVendors);
        setOriginalVendors(savedVendors.map((row) => row.id).filter(Boolean) as string[]);
      }
      if (canDecor && removedDecor.length > 0) {
        await run(supabase.from('requirements').delete().in('id', removedDecor));
      }
      if (canDecor && newDecor.length > 0) {
        await run(
          supabase.from('requirements').insert(
            newDecor.map((row) => ({
              wedding_id: wedding.id,
              event_id: id,
              category: 'Decor',
              item: row.item,
              quantity: 1,
              unit: 'pieces',
              status: 'needed',
            }))
          )
        );
      }
      navigation.goBack();
    } catch (saveError) {
      setError(errorText(saveError));
      setSaving(false);
    }
  }

  async function remove() {
    if (!eventId) {
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      const photos = await rows<{ path: string }>(supabase.from('event_photos').select('path').eq('event_id', eventId));
      if (photos.length > 0) {
        const { error: storageError } = await supabase.storage.from('event-photos').remove(photos.map((photo) => photo.path));
        if (storageError) {
          throw new Error(storageError.message);
        }
      }
      const meals = await rows<{ id: string }>(supabase.from('meals').select('id').eq('event_id', eventId));
      if (meals.length > 0) {
        await run(supabase.from('dishes').delete().in('meal_id', meals.map((meal) => meal.id)));
      }
      for (const table of ['event_photos', 'event_vendors', 'schedule_items', 'guest_events', 'requirements', 'shopping_items', 'meals']) {
        await run(supabase.from(table).delete().eq('event_id', eventId));
      }
      for (const table of ['tasks', 'expenses']) {
        await run(supabase.from(table).update({ event_id: null }).eq('event_id', eventId));
      }
      await run(supabase.from('events').delete().eq('id', eventId));
      setConfirming(false);
      navigation.popToTop();
    } catch (deleteFailure) {
      setDeleteError(errorText(deleteFailure));
      setDeleting(false);
    }
  }

  const back = { label: 'Cancel', onPress: () => navigation.goBack() };

  if (!canEdit) {
    return (
      <Screen back={back}>
        <Note>You can view events but not change them.</Note>
      </Screen>
    );
  }

  if (!loaded) {
    return (
      <Screen back={back}>
        {error ? <ErrorText>{error}</ErrorText> : <Note>Loading event…</Note>}
      </Screen>
    );
  }

  const suggestions = DECOR_IDEAS.filter(
    (idea) => !decor.some((row) => row.item.toLowerCase() === idea.toLowerCase())
  );

  return (
    <Screen back={back} gap={22}>
      <Title>{editing ? 'Edit event' : 'Add an event'}</Title>

      <View style={styles.group}>
        <Label>Which event?</Label>
        <EditableChips
          options={nameOptions}
          onOptionsChange={setNameOptions}
          value={name}
          onChange={setName}
          placeholder="Add your own, e.g. Nalugu"
        />
      </View>

      <View style={styles.group}>
        <Label right={date ? fullDate(date) : 'Pick a date'}>Date</Label>
        <Calendar value={date} onChange={setDate} initialMonth={wedding?.weddingDate} />
      </View>

      <View style={styles.group}>
        <Label right={timeLabel(time)}>Start time</Label>
        <TimePicker value={time} onChange={setTime} />
      </View>

      <View style={styles.group}>
        <Label>Dress code for this event?</Label>
        <ChipGroup
          columns={2}
          options={[
            { key: 'yes', label: 'Yes' },
            { key: 'no', label: 'No' },
          ]}
          selected={[hasDress ? 'yes' : 'no']}
          onPress={(key) => setHasDress(key === 'yes')}
        />
        {hasDress ? (
          <Input
            accessibilityLabel="Describe the dress code"
            placeholder="e.g. Yellow traditional, silk sarees and veshti"
            value={dress}
            onChangeText={setDress}
          />
        ) : null}
      </View>

      <View style={styles.between}>
        <View style={styles.flex}>
          <Label>Expected guests</Label>
          <Text style={styles.hint}>A rough number is fine</Text>
        </View>
        <Stepper name="guests" value={guests} onChange={setGuests} step={5} />
      </View>

      <SectionRule label="VENDORS" />
      <View style={styles.group}>
        <Label right={<Text style={styles.hint}>{plural(vendors.length, 'vendor', 'vendors')}</Text>}>
          Vendors for this event
        </Label>
        {vendors.length === 0 ? (
          <EmptyBox>No vendors yet. Add the decorator, caterer, priest or photographer below.</EmptyBox>
        ) : null}
        {vendors.map((vendor, index) => (
          <Card key={vendor.id ?? `new-${index}`} style={styles.vendor}>
            <Avatar label={initial(vendor.name)} />
            <View style={styles.flex}>
              <Text style={styles.vendorName}>{vendor.name}</Text>
              {vendor.role ? <Text style={styles.hint}>{vendor.role}</Text> : null}
              {vendor.phone ? (
                <Pressable onPress={() => Linking.openURL(`tel:${vendor.phone.replace(/\s/g, '')}`)}>
                  <Text style={styles.phone}>{vendor.phone}</Text>
                </Pressable>
              ) : null}
            </View>
            <IconButton
              label={`Remove ${vendor.name}`}
              onPress={() => setVendors(vendors.filter((_, position) => position !== index))}
            >
              <Icon name="trash" color={colors.maroon} size={17} />
            </IconButton>
          </Card>
        ))}
        <Card style={styles.vendorForm}>
          <Text style={styles.formTitle}>Add a vendor</Text>
          <Input small accessibilityLabel="Vendor name" placeholder="Vendor or shop name" value={vendorName} onChangeText={setVendorName} />
          <Input
            small
            accessibilityLabel="What they do"
            placeholder="What they do, e.g. Decorator, Caterer"
            value={vendorRole}
            onChangeText={setVendorRole}
          />
          <Input
            small
            accessibilityLabel="Contact number"
            placeholder="Contact number, e.g. +91 98765 43210"
            keyboardType="phone-pad"
            value={vendorPhone}
            onChangeText={setVendorPhone}
          />
          <AddButton label="+ Add vendor" onPress={addVendor} />
        </Card>
      </View>

      {access('requirements') === 'edit' ? (
        <>
          <SectionRule label="DECORATION" />
          <View style={styles.group}>
            <Label>Decor items</Label>
            {decor.length > 0 ? (
              <View style={styles.wrap}>
                {decor.map((row) => (
                  <Chip
                    key={row.id ?? row.item}
                    label={row.item}
                    selected
                    onPress={() => undefined}
                    onRemove={() => setDecor(decor.filter((item) => item !== row))}
                  />
                ))}
              </View>
            ) : null}
            {suggestions.length > 0 ? (
              <>
                <Text style={styles.hint}>Tap to add:</Text>
                <View style={styles.wrap}>
                  {suggestions.map((idea) => (
                    <Pressable key={idea} style={styles.suggest} onPress={() => addDecor(idea)}>
                      <Text style={styles.suggestText}>{`+ ${idea}`}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
            <View style={styles.addRow}>
              <Input
                small
                style={styles.flex}
                accessibilityLabel="Add a decor item"
                placeholder="Add your own decor item"
                value={decorDraft}
                onChangeText={setDecorDraft}
                onSubmitEditing={() => addDecor(decorDraft)}
              />
              <AddButton onPress={() => addDecor(decorDraft)} />
            </View>
          </View>
        </>
      ) : null}

      <ErrorText>{error}</ErrorText>
      <PrimaryButton
        label={saving ? 'Saving…' : editing ? 'Save changes' : 'Save event'}
        onPress={save}
        disabled={saving}
      />
      {editing ? (
        <SecondaryButton
          tone="maroon"
          label="Delete this event"
          icon={<Icon name="trash" color={colors.maroon} size={18} />}
          onPress={() => setConfirming(true)}
          disabled={saving}
        />
      ) : null}

      <ConfirmDialog
        visible={confirming}
        title="Delete this event?"
        message={`${name ?? 'This event'} will be removed with its photos, schedule, vendors, invitations, requirements, shopping items and meals. Tasks and expenses stay and move to the whole wedding.`}
        busy={deleting}
        error={deleteError}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 10 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  flex: { flex: 1, gap: 2 },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  vendor: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  vendorName: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.ink },
  phone: { fontFamily: fonts.bold, fontSize: 14, color: colors.maroon, paddingVertical: 4 },
  vendorForm: { padding: 12, gap: 8 },
  formTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  suggest: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.tickBorder,
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  suggestText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.brownInk },
  addRow: { flexDirection: 'row', gap: 8 },
});
