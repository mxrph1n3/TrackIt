import { useEffect, useRef } from 'react';

import { handleTrackItDeepLink } from '../lib/navigation/deepLinkRouter';
import {
  notificationsSupportedInRuntime,
  readNotificationDeepLink,
  subscribeToNotificationResponses,
} from '../lib/notifications/reminderService';

export function useNotificationDeepLinks() {
  const handledColdStart = useRef(false);

  useEffect(() => {
    if (!notificationsSupportedInRuntime) {
      return;
    }

    const unsubscribe = subscribeToNotificationResponses((url) => {
      handleTrackItDeepLink(url);
    });

    if (!handledColdStart.current) {
      handledColdStart.current = true;
      void readNotificationDeepLink().then((url) => {
        if (url) {
          handleTrackItDeepLink(url);
        }
      });
    }

    return unsubscribe;
  }, []);
}
