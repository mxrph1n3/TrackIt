import { useEffect, useState } from 'react';

import { useShellBackNavigation } from '../../hooks/useShellBackNavigation';
import { IS_WEB } from '../../lib/platform/constants';
import { getTelegramWebApp, isTelegramMiniApp } from '../../lib/telegram/telegramWebApp';
import { navigationRef } from '../../navigation/navigationRef';
import { useCreateHubStore } from '../../stores/useCreateHubStore';
import { usePaywallStore } from '../../stores/usePaywallStore';
import { useProfileModuleStore } from '../../stores/useProfileModuleStore';
import { useSideDrawerStore } from '../../stores/useSideDrawerStore';

type TelegramBackButtonSyncProps = {
  navigationReady: boolean;
};

function canNavigateBack(): boolean {
  return navigationRef.isReady() && navigationRef.canGoBack();
}

/** Shows Telegram Main App back button when shell overlays or stack depth allow going back. */
export function TelegramBackButtonSync({ navigationReady }: TelegramBackButtonSyncProps) {
  const handleBack = useShellBackNavigation();
  const hubOpen = useCreateHubStore((s) => s.isOpen);
  const paywallOpen = usePaywallStore((s) => s.isOpen);
  const drawerOpen = useSideDrawerStore((s) => s.isOpen);
  const profileModule = useProfileModuleStore((s) => s.activeModule);
  const [navCanGoBack, setNavCanGoBack] = useState(false);

  useEffect(() => {
    if (!navigationReady || !IS_WEB || !isTelegramMiniApp()) {
      return;
    }

    const syncNavBack = () => {
      setNavCanGoBack(canNavigateBack());
    };

    syncNavBack();
    return navigationRef.addListener('state', syncNavBack);
  }, [drawerOpen, hubOpen, paywallOpen, navigationReady, profileModule]);

  useEffect(() => {
    if (!IS_WEB || !isTelegramMiniApp()) {
      return;
    }

    const backButton = getTelegramWebApp()?.BackButton;
    if (!backButton) {
      return;
    }

    const shouldShow = hubOpen || paywallOpen || drawerOpen || profileModule != null || navCanGoBack;
    if (shouldShow) {
      backButton.show();
    } else {
      backButton.hide();
    }
  }, [drawerOpen, hubOpen, navCanGoBack, paywallOpen, profileModule]);

  useEffect(() => {
    if (!IS_WEB || !isTelegramMiniApp()) {
      return;
    }

    const backButton = getTelegramWebApp()?.BackButton;
    if (!backButton) {
      return;
    }

    const onClick = () => {
      handleBack();
    };

    backButton.onClick(onClick);
    return () => {
      backButton.offClick(onClick);
    };
  }, [handleBack]);

  return null;
}
