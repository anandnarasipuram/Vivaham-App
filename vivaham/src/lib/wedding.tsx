import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { accessFor } from './roles';
import { supabase } from './supabase';

export type Access = 'none' | 'view' | 'edit';

export type Wedding = {
  id: string;
  name: string;
  weddingDate: string | null;
  budgetLimit: number | null;
  role: string;
  userId: string;
  displayName: string | null;
  modules: Record<string, string>;
};

type Row = {
  role: string;
  display_name: string | null;
  modules: Record<string, string> | null;
  weddings: { id: string; name: string; wedding_date: string | null; budget_limit: number | null } | null;
};

type WeddingState = {
  wedding: Wedding | null;
  loading: boolean;
  error: string;
  access: (module: string) => Access;
  reload: () => Promise<void>;
};

const WeddingContext = createContext<WeddingState | undefined>(undefined);

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id ?? '';
    const { data, error: loadError } = await supabase
      .from('wedding_members')
      .select('role, modules, display_name, weddings(id, name, wedding_date, budget_limit)')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }
    setError('');
    const row = data as unknown as Row | null;
    if (row && row.weddings) {
      setWedding({
        id: row.weddings.id,
        name: row.weddings.name,
        weddingDate: row.weddings.wedding_date,
        budgetLimit: row.weddings.budget_limit === null ? null : Number(row.weddings.budget_limit),
        role: row.role,
        userId,
        displayName: row.display_name,
        modules: row.modules ?? {},
      });
    } else {
      setWedding(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const access = useCallback(
    (module: string): Access => {
      return wedding ? accessFor(wedding.role, wedding.modules, module) : 'none';
    },
    [wedding]
  );

  return (
    <WeddingContext.Provider value={{ wedding, loading, error, access, reload: load }}>
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const value = useContext(WeddingContext);
  if (!value) {
    throw new Error('useWedding must be used inside WeddingProvider');
  }
  return value;
}
