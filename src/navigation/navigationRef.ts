import { createNavigationContainerRef } from '@react-navigation/native';

import type { HealthStackParamList } from './healthTypes';
import type { RootTabParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootTabParamList>();

export function navigateTab(routeName: keyof RootTabParamList) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(routeName);
  }
}

export function navigateHealthScreen<T extends Exclude<keyof HealthStackParamList, 'Hub'>>(
  screen: T,
  params?: HealthStackParamList[T],
) {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.navigate('Health', {
    screen,
    params,
  } as never);
}

export function getActiveTabRoute(): keyof RootTabParamList | null {
  if (!navigationRef.isReady()) {
    return null;
  }

  const state = navigationRef.getRootState();
  const route = state.routes[state.index];
  return (route?.name as keyof RootTabParamList) ?? null;
}
