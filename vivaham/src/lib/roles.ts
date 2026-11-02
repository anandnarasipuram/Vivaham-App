export type Level = 'none' | 'view' | 'edit';
export type Role = 'admin' | 'family' | 'helper';

export const MODULES = [
  { key: 'events', label: 'Events' },
  { key: 'guests', label: 'Guests' },
  { key: 'stays', label: 'Stays' },
  { key: 'transport', label: 'Transport' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'food', label: 'Food' },
  { key: 'todo', label: 'To-do' },
  { key: 'budget', label: 'Budget' },
];

export const LEVELS: { key: Level; label: string }[] = [
  { key: 'none', label: 'Hidden' },
  { key: 'view', label: 'View' },
  { key: 'edit', label: 'Edit' },
];

export const ROLES: { key: Role; label: string }[] = [
  { key: 'family', label: 'Family' },
  { key: 'helper', label: 'Helper' },
  { key: 'admin', label: 'Admin' },
];

export const PRESETS: Record<Role, Record<string, Level>> = {
  admin: {},
  family: {
    events: 'view',
    guests: 'edit',
    stays: 'view',
    transport: 'view',
    shopping: 'edit',
    requirements: 'edit',
    food: 'view',
    todo: 'edit',
    budget: 'none',
  },
  helper: {
    events: 'none',
    guests: 'none',
    stays: 'none',
    transport: 'none',
    shopping: 'none',
    requirements: 'edit',
    food: 'none',
    todo: 'edit',
    budget: 'none',
  },
};

export function roleLabel(role: string) {
  return ROLES.find((item) => item.key === role)?.label ?? role;
}

export function levelOf(modules: Record<string, string> | null, module: string): Level {
  const value = modules?.[module];
  return value === 'edit' || value === 'view' ? value : 'none';
}

export function accessFor(role: string | undefined, modules: Record<string, string> | null, module: string): Level {
  if (!role) {
    return 'none';
  }
  if (role === 'admin') {
    return 'edit';
  }
  return levelOf(modules, module);
}
