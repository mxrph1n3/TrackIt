import { useEffect } from 'react';

import { hydrateCatalog } from '../lib/catalog';

export function useCatalogSync() {
  useEffect(() => {
    void hydrateCatalog();
  }, []);
}
