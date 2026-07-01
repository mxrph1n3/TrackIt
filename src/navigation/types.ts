import type { NavigatorScreenParams } from '@react-navigation/native';

import type { HealthStackParamList } from './healthTypes';

export type RootTabParamList = {
  Dashboard: undefined;
  Planner: undefined;
  Health: NavigatorScreenParams<HealthStackParamList> | undefined;
  Analytics: undefined;
};

export type RootTabRouteName = keyof RootTabParamList;
