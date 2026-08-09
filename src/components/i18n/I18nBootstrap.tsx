import { useEffect } from 'react';

import { useLocaleStore } from '../../stores/useLocaleStore';

/** Loads saved language preference (or system) before UI relies on t(). */
export function I18nBootstrap() {
  const hydrate = useLocaleStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return null;
}
