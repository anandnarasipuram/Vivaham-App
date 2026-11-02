import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from './supabase';

type QueryResult = { data: unknown; error: { message: string } | null };
type WriteResult = { error: { message: string } | null };

export async function rows<T>(query: PromiseLike<QueryResult>): Promise<T[]> {
  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as T[];
}

export async function one<T>(query: PromiseLike<QueryResult>): Promise<T> {
  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return data as T;
}

export async function run(query: PromiseLike<WriteResult>) {
  const { error } = await query;
  if (error) {
    throw new Error(error.message);
  }
}

export function errorText(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function useFocusData<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const reload = useCallback(async () => {
    try {
      const result = await loaderRef.current();
      setData(result);
      setError('');
    } catch (loadError) {
      setError(errorText(loadError));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reload, ...deps])
  );

  return { data, error, reload };
}

export type EventRow = {
  id: string;
  name: string;
  event_date: string;
  start_time: string | null;
  expected_guests: number | null;
  dress_code: string | null;
  highlights: string | null;
  notes: string | null;
};

export function fetchEvents() {
  return rows<EventRow>(
    supabase
      .from('events')
      .select('id, name, event_date, start_time, expected_guests, dress_code, highlights, notes')
      .order('event_date')
      .order('start_time')
  );
}

const PEOPLE_SOURCES = [
  { module: 'requirements', table: 'requirements', column: 'assigned_to' },
  { module: 'shopping', table: 'shopping_items', column: 'person' },
  { module: 'budget', table: 'expenses', column: 'paid_by' },
  { module: 'todo', table: 'tasks', column: 'owner' },
];

export async function fetchPeople(can: (module: string) => boolean) {
  const sources = PEOPLE_SOURCES.filter((source) => can(source.module));
  const results = await Promise.all(
    sources.map((source) => supabase.from(source.table).select(source.column))
  );
  const names = new Set<string>();
  results.forEach((result, index) => {
    const column = sources[index].column;
    ((result.data ?? []) as unknown as Record<string, string | null>[]).forEach((row) => {
      const name = row[column]?.trim();
      if (name) {
        names.add(name);
      }
    });
  });
  return [...names].sort((a, b) => a.localeCompare(b));
}
