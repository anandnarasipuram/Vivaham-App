import { useEffect, useState } from 'react';
import { Platform, Share, StyleSheet, Text, View } from 'react-native';
import AccessEditor from '../components/AccessEditor';
import { AddButton, IconButton, PrimaryButton, SecondaryButton } from '../components/Buttons';
import Calendar from '../components/Calendar';
import { ChipGroup } from '../components/Chips';
import Collapsible from '../components/Collapsible';
import { ConfirmDialog } from '../components/Dialog';
import Field, { Input } from '../components/Field';
import Icon from '../components/Icon';
import Screen from '../components/Screen';
import { Avatar, Badge, Card, ErrorText, Label, Lead, Note, Title } from '../components/ui';
import { errorText, rows, run, useFocusData } from '../lib/data';
import { fullDate, initial, shortDate } from '../lib/format';
import { copyText, joinLink, joinMessage, openWhatsApp } from '../lib/messages';
import { Level, PRESETS, Role, roleLabel, ROLES } from '../lib/roles';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';

type Member = { user_id: string; role: string; modules: Record<string, string> | null; display_name: string | null };
type Invite = { code: string; role: string; expires_at: string | null };

export default function SettingsScreen() {
  const navigation = useNav();
  const { wedding, reload } = useWedding();
  const isAdmin = wedding?.role === 'admin';
  const [myName, setMyName] = useState(wedding?.displayName ?? '');
  const [weddingName, setWeddingName] = useState(wedding?.name ?? '');
  const [weddingDate, setWeddingDate] = useState<string | null>(wedding?.weddingDate ?? null);
  const [savingName, setSavingName] = useState(false);
  const [savingWedding, setSavingWedding] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<Member | null>(null);
  const [inviteRole, setInviteRole] = useState<Role>('family');
  const [inviteModules, setInviteModules] = useState<Record<string, Level>>(PRESETS.family);
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    setMyName(wedding?.displayName ?? '');
    setWeddingName(wedding?.name ?? '');
    setWeddingDate(wedding?.weddingDate ?? null);
  }, [wedding]);

  const { data, error, reload: reloadLists } = useFocusData(async () => {
    if (!wedding || !isAdmin) {
      return { members: [] as Member[], invites: [] as Invite[] };
    }
    const [members, invites] = await Promise.all([
      rows<Member>(
        supabase.from('wedding_members').select('user_id, role, modules, display_name').eq('wedding_id', wedding.id)
      ),
      rows<Invite>(
        supabase
          .from('wedding_invites')
          .select('code, role, expires_at')
          .eq('wedding_id', wedding.id)
          .is('used_by', null)
          .order('expires_at')
      ),
    ]);
    members.sort((a, b) => (a.display_name ?? 'Member').localeCompare(b.display_name ?? 'Member'));
    return { members, invites };
  }, [wedding?.id, isAdmin]);

  async function act(action: () => Promise<void>, affectsMe = false) {
    setBusy(true);
    setActionError('');
    setNotice('');
    try {
      await action();
      await reloadLists();
      if (affectsMe) {
        await reload();
      }
    } catch (failure) {
      setActionError(errorText(failure));
    }
    setBusy(false);
  }

  async function saveMyName() {
    if (!wedding) {
      return;
    }
    setSavingName(true);
    setActionError('');
    try {
      await run(
        supabase
          .from('wedding_members')
          .update({ display_name: myName.trim() || null })
          .eq('wedding_id', wedding.id)
          .eq('user_id', wedding.userId)
      );
      await reload();
      await reloadLists();
      setNotice('Your name is saved.');
    } catch (failure) {
      setActionError(errorText(failure));
    }
    setSavingName(false);
  }

  async function saveWedding() {
    if (!wedding) {
      return;
    }
    if (!weddingName.trim()) {
      setActionError('The wedding needs a name.');
      return;
    }
    setSavingWedding(true);
    setActionError('');
    try {
      await run(
        supabase.from('weddings').update({ name: weddingName.trim(), wedding_date: weddingDate }).eq('id', wedding.id)
      );
      await reload();
      setNotice('Wedding details are saved.');
    } catch (failure) {
      setActionError(errorText(failure));
    }
    setSavingWedding(false);
  }

  const members = data?.members ?? [];
  const adminCount = members.filter((member) => member.role === 'admin').length;

  function changeRole(member: Member, role: Role) {
    if (member.role === role) {
      return;
    }
    if (member.role === 'admin' && adminCount <= 1) {
      setActionError('This is the only admin. Make someone else an admin first.');
      return;
    }
    act(
      () =>
        run(
          supabase
            .from('wedding_members')
            .update({ role, modules: PRESETS[role] })
            .eq('wedding_id', wedding?.id)
            .eq('user_id', member.user_id)
        ),
      member.user_id === wedding?.userId
    );
  }

  function changeAccess(member: Member, module: string, level: Level) {
    act(() =>
      run(
        supabase
          .from('wedding_members')
          .update({ modules: { ...(member.modules ?? {}), [module]: level } })
          .eq('wedding_id', wedding?.id)
          .eq('user_id', member.user_id)
      )
    );
  }

  async function removeMember() {
    if (!removing) {
      return;
    }
    await act(() =>
      run(supabase.from('wedding_members').delete().eq('wedding_id', wedding?.id).eq('user_id', removing.user_id))
    );
    setRemoving(null);
  }

  async function createInvite() {
    if (!wedding) {
      return;
    }
    setCreating(true);
    setActionError('');
    setCode('');
    const { data: created, error: createError } = await supabase.rpc('create_invite', {
      p_wedding: wedding.id,
      p_role: inviteRole,
      p_modules: inviteRole === 'admin' ? {} : inviteModules,
    });
    setCreating(false);
    if (createError) {
      setActionError(createError.message);
      return;
    }
    setCode(String(created));
    await reloadLists();
  }

  const messageFor = (inviteCode: string) => joinMessage(inviteCode, wedding?.name ?? 'our wedding');
  const share = (inviteCode: string) => (
    <InviteShare
      code={inviteCode}
      message={messageFor(inviteCode)}
      onError={(failure) => setActionError(errorText(failure))}
    />
  );

  return (
    <Screen back={{ label: 'Home', onPress: () => navigation.goBack() }} gap={20}>
      <Title>Settings</Title>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      <ErrorText>{actionError}</ErrorText>

      <Card style={styles.card}>
        <Field
          label="Your name"
          placeholder="How others see you, e.g. Anand"
          autoCapitalize="words"
          value={myName}
          onChangeText={setMyName}
        />
        <AddButton label={savingName ? 'Saving…' : 'Save my name'} onPress={saveMyName} disabled={savingName} />
      </Card>

      {isAdmin ? (
        <Card style={styles.card}>
          <Field label="Wedding name" placeholder="e.g. Akhil’s wedding" value={weddingName} onChangeText={setWeddingName} />
          <Label right={weddingDate ? fullDate(weddingDate) : 'Pick a date'}>Wedding date</Label>
          <Calendar value={weddingDate} onChange={setWeddingDate} />
          <AddButton
            label={savingWedding ? 'Saving…' : 'Save wedding details'}
            onPress={saveWedding}
            disabled={savingWedding}
          />
        </Card>
      ) : null}

      {isAdmin ? (
        <View style={styles.section}>
          <Text style={styles.h2}>Members</Text>
          <ErrorText>{error}</ErrorText>
          {!data && !error ? <Note>Loading members…</Note> : null}
          {members.map((member) => {
            const me = member.user_id === wedding?.userId;
            const name = member.display_name || 'Member';
            return (
              <Card key={member.user_id} style={styles.card}>
                <View style={styles.memberHead}>
                  <Avatar label={initial(name)} tone={member.role === 'admin' ? 'rose' : 'gold'} />
                  <View style={styles.flex}>
                    <Text style={styles.memberName}>{me ? `${name} (you)` : name}</Text>
                    <View style={styles.badgeRow}>
                      <Badge tone={member.role === 'admin' ? 'rose' : 'gold'} label={roleLabel(member.role)} />
                    </View>
                  </View>
                  {!me ? (
                    <IconButton label={`Remove ${name}`} onPress={() => setRemoving(member)} disabled={busy}>
                      <Icon name="trash" color={colors.maroon} size={18} />
                    </IconButton>
                  ) : null}
                </View>
                <Collapsible title="Role and access">
                  <View style={styles.inner}>
                    <ChipGroup
                      columns={3}
                      options={ROLES}
                      selected={[member.role]}
                      disabled={busy}
                      onPress={(role) => changeRole(member, role as Role)}
                    />
                    {member.role === 'admin' ? (
                      <Text style={styles.small}>Admins can see and change everything.</Text>
                    ) : (
                      <AccessEditor
                        modules={member.modules}
                        disabled={busy}
                        onChange={(module, level) => changeAccess(member, module, level)}
                      />
                    )}
                  </View>
                </Collapsible>
              </Card>
            );
          })}
        </View>
      ) : null}

      {isAdmin ? (
        <View style={styles.section}>
          <Text style={styles.h2}>Invite someone</Text>
          <Card style={styles.card}>
            <Lead>Choose what they can do. You can change it later in Members.</Lead>
            <ChipGroup
              columns={3}
              options={ROLES}
              selected={[inviteRole]}
              onPress={(role) => {
                setInviteRole(role as Role);
                setInviteModules(PRESETS[role as Role]);
              }}
            />
            {inviteRole === 'admin' ? (
              <Text style={styles.small}>Admins can see and change everything, including members.</Text>
            ) : (
              <Collapsible title="Adjust access">
                <AccessEditor
                  modules={inviteModules}
                  onChange={(module, level) => setInviteModules({ ...inviteModules, [module]: level })}
                />
              </Collapsible>
            )}
            <PrimaryButton
              size="medium"
              label={creating ? 'Creating…' : 'Create invite code'}
              onPress={createInvite}
              disabled={creating}
            />
            {code ? (
              <View style={styles.codeBox}>
                <Text style={styles.small}>Invite code</Text>
                <Text selectable style={styles.code}>
                  {code}
                </Text>
                {joinLink(code) ? (
                  <Text selectable style={styles.link}>
                    {joinLink(code)}
                  </Text>
                ) : null}
                {share(code)}
                {Platform.OS !== 'web' ? (
                  <SecondaryButton label="Share another way" onPress={() => Share.share({ message: messageFor(code) })} />
                ) : null}
              </View>
            ) : null}
          </Card>

          <Text style={styles.h3}>Open invites</Text>
          {data && data.invites.length === 0 ? <Note>No open invites.</Note> : null}
          {(data?.invites ?? []).map((invite) => (
            <Card key={invite.code} style={styles.inviteCard}>
              <View style={styles.inviteRow}>
                <View style={styles.flex}>
                  <Text selectable style={styles.inviteCode}>
                    {invite.code}
                  </Text>
                  <Text style={styles.small}>
                    {[roleLabel(invite.role), invite.expires_at ? `Expires ${shortDate(invite.expires_at.slice(0, 10))}` : '']
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <IconButton
                  label={`Delete invite ${invite.code}`}
                  disabled={busy}
                  onPress={() =>
                    act(() => run(supabase.from('wedding_invites').delete().eq('code', invite.code)))
                  }
                >
                  <Icon name="trash" color={colors.maroon} size={18} />
                </IconButton>
              </View>
              {share(invite.code)}
            </Card>
          ))}
        </View>
      ) : null}

      <SecondaryButton tone="maroon" label="Log out" onPress={() => supabase.auth.signOut()} />

      <ConfirmDialog
        visible={removing !== null}
        title="Remove this member?"
        message={
          removing
            ? removing.role === 'admin' && adminCount <= 1
              ? 'This is the only admin, so they cannot be removed.'
              : `${removing.display_name || 'This member'} will no longer see this wedding. You can invite them again later.`
            : ''
        }
        confirmLabel="Yes, remove"
        busy={busy}
        error={actionError}
        onConfirm={() => {
          if (removing && removing.role === 'admin' && adminCount <= 1) {
            setRemoving(null);
            return;
          }
          removeMember();
        }}
        onCancel={() => setRemoving(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 12 },
  section: { gap: 12 },
  h2: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink },
  h3: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  notice: { fontFamily: fonts.bold, fontSize: 15, color: colors.green },
  flex: { flex: 1, gap: 4 },
  memberHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberName: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  badgeRow: { flexDirection: 'row' },
  inner: { gap: 12 },
  small: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  codeBox: {
    backgroundColor: colors.cream,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: 14,
    gap: 10,
    alignItems: 'stretch',
  },
  code: {
    fontFamily: fonts.extrabold,
    fontSize: 34,
    letterSpacing: 6,
    color: colors.maroon,
    textAlign: 'center',
  },
  inviteCard: { padding: 12, paddingLeft: 16, gap: 10 },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  link: { fontFamily: fonts.semibold, fontSize: 14, color: colors.brownInk, textAlign: 'center' },
  shareRow: { flexDirection: 'row', gap: 8 },
  shareFlex: { flex: 1 },
  inviteCode: { fontFamily: fonts.extrabold, fontSize: 18, letterSpacing: 3, color: colors.ink },
});

function InviteShare({ code, message, onError }: { code: string; message: string; onError: (failure: unknown) => void }) {
  const link = joinLink(code);
  return (
    <View style={styles.shareRow}>
      <View style={styles.shareFlex}>
        <PrimaryButton
          size="small"
          color={colors.whatsapp}
          icon={<Icon name="chat" color={colors.white} size={18} />}
          label="WhatsApp"
          onPress={() => openWhatsApp(message).catch(onError)}
        />
      </View>
      <View style={styles.shareFlex}>
        <SecondaryButton
          label={link ? 'Copy link' : 'Copy code'}
          onPress={() => copyText(link || code).catch(onError)}
        />
      </View>
    </View>
  );
}
