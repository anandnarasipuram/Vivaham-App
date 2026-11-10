// tiny shared state: who is logged in, which wedding, my role
export const S = { user: null, profile: null, wedding: null, weddings: [], members: [], events: [] };
export const canEdit = () => S.wedding && S.wedding.role !== 'helper';
export const isAdmin = () => S.wedding && S.wedding.role === 'admin';
export const wid = () => S.wedding.wedding_id;
export const myMember = () => S.members.find((m) => m.user_id === S.user?.id);
export const memberName = (id) => S.members.find((m) => m.id === id)?.name || '';
export const eventName = (id) => S.events.find((e) => e.id === id)?.type || '';
