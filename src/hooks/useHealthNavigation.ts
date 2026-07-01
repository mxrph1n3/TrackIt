import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import type { HealthStackParamList } from '../navigation/healthTypes';

type HealthChildScreen = Exclude<keyof HealthStackParamList, 'Hub'>;

export function useHealthNavigation() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  return {
    push: (screen: HealthChildScreen, params?: HealthStackParamList[HealthChildScreen]) => {
      navigation.navigate(screen, params);
    },
    pop: () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
  };
}
