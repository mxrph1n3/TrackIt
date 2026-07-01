import type { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '../supabase';

type PostgresBinding = {
  config: {
    event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
    schema: string;
    table: string;
    filter?: string;
  };
};

const channelsByKey = new Map<string, RealtimeChannel>();
const listenersByKey = new Map<string, Set<() => void>>();
const creatingKeys = new Set<string>();

function notifyListeners(key: string) {
  const listeners = listenersByKey.get(key);
  if (!listeners) {
    return;
  }

  for (const listener of listeners) {
    listener();
  }
}

function removeStaleChannels(key: string) {
  const topic = `realtime:${key}`;

  for (const channel of supabase.getChannels()) {
    if (channel.topic === topic) {
      void supabase.removeChannel(channel);
    }
  }

  channelsByKey.delete(key);
}

function ensurePostgresChannel(key: string, bindings: PostgresBinding[]) {
  if (channelsByKey.has(key) || creatingKeys.has(key)) {
    return;
  }

  creatingKeys.add(key);
  removeStaleChannels(key);

  let channel = supabase.channel(key);

  for (const binding of bindings) {
    channel = channel.on('postgres_changes', binding.config, () => {
      notifyListeners(key);
    });
  }

  channelsByKey.set(key, channel.subscribe());
  creatingKeys.delete(key);
}

export function subscribePostgresChanges(
  key: string,
  bindings: PostgresBinding[],
  listener: () => void,
): () => void {
  let listeners = listenersByKey.get(key);
  if (!listeners) {
    listeners = new Set();
    listenersByKey.set(key, listeners);
  }

  listeners.add(listener);
  ensurePostgresChannel(key, bindings);

  return () => {
    const activeListeners = listenersByKey.get(key);
    activeListeners?.delete(listener);

    if (!activeListeners || activeListeners.size === 0) {
      listenersByKey.delete(key);
      const channel = channelsByKey.get(key);
      if (channel) {
        void supabase.removeChannel(channel);
      }
      channelsByKey.delete(key);
      removeStaleChannels(key);
    }
  };
}
