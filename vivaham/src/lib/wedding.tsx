import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

export type Access = 'none' | 'view' | 'edit';

export type Wedding = {
  id: string;
  name: string;
  weddingDate: string | null;
  role: string;
  modules: Record<string, string>;
};

type Row = {
  role: string;
  modules: Record<string, string> | null;
  weddings: { id: string; name: string; wedding_date: string | null } | null;
};

type WeddingState = {
  wedding: Wedding | null;
  loading: boolean;
  error: string;
  access: (module: string) => Access;
};

const WeddingContext = createContext<WeddingState | undefined>(undefined);

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from('wedding_members')
      .select('role, modules, weddings(id, name, wedding_date)')
      .limit(1)
      .maybeSingle();
    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }
    const row = data as unknown as Row | null;
    if (row && row.weddings) {
      setWedding({
        id: row.weddings.id,
        name: row.weddings.name,
        weddingDate: row.weddings.wedding_date,
        role: row.role,
        modules: row.modules ?? {},
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const access = useCallback(
    (module: string): Access => {
      if (!wedding) {
        return 'none';
      }
      if (wedding.role === 'admin') {
        return 'edit';
      }
      const value = wedding.modules[module];
      return value === 'edit' || value === 'view' ? value : 'none';
    },
    [wedding]
  );

  return (
    <WeddingContext.Provider value={{ wedding, loading, error, access }}>
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
