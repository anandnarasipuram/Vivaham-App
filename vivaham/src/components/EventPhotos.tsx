import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { errorText, rows, run, useFocusData } from '../lib/data';
import { plural } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { colors, fonts } from '../theme';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { ConfirmDialog, Dialog } from './Dialog';
import { Input } from './Field';
import Icon from './Icon';
import { Card, ErrorText } from './ui';

const BUCKET = 'event-photos';

type Photo = { id: string; path: string; caption: string | null; url: string | null };

export default function EventPhotos({ eventId }: { eventId: string }) {
  const { wedding, access } = useWedding();
  const canEdit = access('events') === 'edit';
  const [choosing, setChoosing] = useState(false);
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState('');
  const [actionError, setActionError] = useState('');
  const [viewing, setViewing] = useState<Photo | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: photos, error, reload } = useFocusData(async () => {
    const list = await rows<{ id: string; path: string; caption: string | null }>(
      supabase.from('event_photos').select('id, path, caption').eq('event_id', eventId).order('created_at')
    );
    if (list.length === 0) {
      return [] as Photo[];
    }
    const { data: signed, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(
        list.map((photo) => photo.path),
        3600
      );
    if (signError) {
      throw new Error(signError.message);
    }
    return list.map((photo) => ({
      ...photo,
      url: signed?.find((item) => item.path === photo.path)?.signedUrl ?? null,
    }));
  }, [eventId]);

  async function pick(source: 'gallery' | 'camera') {
    setActionError('');
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setActionError(
        source === 'camera'
          ? 'Vivaham needs camera access to take photos. You can allow it in your phone settings.'
          : 'Vivaham needs access to your photos. You can allow it in your phone settings.'
      );
      return;
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6 };
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync({ ...options, allowsMultipleSelection: true, selectionLimit: 20 });
    if (result.canceled || result.assets.length === 0) {
      return;
    }
    setChoosing(false);
    await upload(result.assets.map((asset) => asset.uri));
  }

  async function upload(uris: string[]) {
    if (!wedding) {
      return;
    }
    setBusy(true);
    let done = 0;
    try {
      for (const uri of uris) {
        setProgress(`Uploading ${done + 1} of ${uris.length}…`);
        const buffer = await (await fetch(uri)).arrayBuffer();
        const path = `${wedding.id}/${eventId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, buffer, { contentType: 'image/jpeg' });
        if (uploadError) {
          throw new Error(uploadError.message);
        }
        await run(
          supabase.from('event_photos').insert({
            wedding_id: wedding.id,
            event_id: eventId,
            path,
            caption: caption.trim() || null,
          })
        );
        done += 1;
      }
      setCaption('');
    } catch (failure) {
      setActionError(`${done > 0 ? `${plural(done, 'photo', 'photos')} added, then: ` : ''}${errorText(failure)}`);
    }
    setProgress('');
    setBusy(false);
    await reload();
  }

  async function remove() {
    if (!viewing) {
      return;
    }
    setBusy(true);
    setActionError('');
    try {
      const { error: removeError } = await supabase.storage.from(BUCKET).remove([viewing.path]);
      if (removeError) {
        throw new Error(removeError.message);
      }
      await run(supabase.from('event_photos').delete().eq('id', viewing.id));
      setConfirming(false);
      setViewing(null);
      await reload();
    } catch (failure) {
      setActionError(errorText(failure));
    }
    setBusy(false);
  }

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Photos</Text>
        {photos && photos.length > 0 ? <Text style={styles.small}>{plural(photos.length, 'photo', 'photos')}</Text> : null}
      </View>
      <ErrorText>{error || actionError}</ErrorText>
      {photos === null && !error ? <Text style={styles.small}>Loading photos…</Text> : null}
      {photos && photos.length === 0 ? (
        <Text style={styles.small}>No photos yet. Add decoration ideas or photos from the day.</Text>
      ) : null}
      {photos && photos.length > 0 ? (
        <View style={styles.grid}>
          {photos.map((photo) => (
            <Pressable
              key={photo.id}
              accessibilityRole="imagebutton"
              accessibilityLabel={photo.caption ?? 'Event photo'}
              style={styles.thumb}
              onPress={() => setViewing(photo)}
            >
              {photo.url ? <Image source={{ uri: photo.url }} style={styles.image} /> : null}
              {photo.caption ? (
                <Text style={styles.thumbCaption} numberOfLines={1}>
                  {photo.caption}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}
      {progress ? <Text style={styles.progress}>{progress}</Text> : null}
      {canEdit ? (
        <SecondaryButton
          tone="maroon"
          icon={<Icon name="camera" color={colors.maroon} size={18} />}
          label={busy ? 'Please wait…' : 'Add photos'}
          onPress={() => setChoosing(true)}
          disabled={busy}
        />
      ) : null}

      <Dialog visible={choosing} title="Add photos" onClose={() => setChoosing(false)}>
        <Input
          small
          accessibilityLabel="Caption"
          placeholder="Caption (optional), e.g. Stage decor idea"
          value={caption}
          onChangeText={setCaption}
        />
        <PrimaryButton size="medium" label="Choose from gallery" onPress={() => pick('gallery')} />
        <PrimaryButton size="medium" label="Take a photo" onPress={() => pick('camera')} />
        <SecondaryButton label="Cancel" onPress={() => setChoosing(false)} />
      </Dialog>

      <Modal visible={viewing !== null} animationType="fade" onRequestClose={() => setViewing(null)}>
        <View style={styles.viewer}>
          {viewing?.url ? <Image source={{ uri: viewing.url }} style={styles.full} resizeMode="contain" /> : null}
          {viewing?.caption ? <Text style={styles.caption}>{viewing.caption}</Text> : null}
          <ErrorText>{actionError}</ErrorText>
          <View style={styles.viewerButtons}>
            {canEdit ? (
              <View style={styles.flex}>
                <SecondaryButton
                  tone="maroon"
                  icon={<Icon name="trash" color={colors.maroon} size={18} />}
                  label="Delete"
                  onPress={() => setConfirming(true)}
                />
              </View>
            ) : null}
            <View style={styles.flex}>
              <PrimaryButton size="medium" label="Close" onPress={() => setViewing(null)} />
            </View>
          </View>
        </View>
        <ConfirmDialog
          visible={confirming}
          title="Delete this photo?"
          message="The photo will be removed for everyone in the wedding."
          busy={busy}
          error={actionError}
          onConfirm={remove}
          onCancel={() => setConfirming(false)}
        />
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 12 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  small: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumb: {
    width: '48%',
    flexGrow: 1,
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.tintSand,
    justifyContent: 'flex-end',
  },
  image: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  thumbCaption: {
    margin: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(42,26,20,0.55)',
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.white,
  },
  progress: { fontFamily: fonts.semibold, fontSize: 14, color: colors.maroon },
  viewer: { flex: 1, backgroundColor: colors.ink, padding: 20, paddingTop: 60, gap: 14 },
  full: { flex: 1, width: '100%' },
  caption: { fontFamily: fonts.semibold, fontSize: 16, color: colors.white, textAlign: 'center' },
  viewerButtons: { flexDirection: 'row', gap: 10, paddingBottom: 20 },
  flex: { flex: 1 },
});
