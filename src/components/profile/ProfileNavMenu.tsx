import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { PROFILE_MENU_ITEMS } from '../../constants/profileMenu';
import { isAppFullyFree } from '../../constants/appAccess';
import { navigateTab } from '../../navigation/navigationRef';
import type { RootTabParamList } from '../../navigation/types';
import { useProfileModuleStore } from '../../stores/useProfileModuleStore';
import { useProfileStore } from '../../stores/useProfileStore';
import type { ProfileMenuItem, ProfileModuleId } from '../../types/profile';
import { useTheme } from '../../theme/ThemeContext';

type ProfileNavMenuProps = {
  forcedActiveId?: ProfileModuleId;
  onModulePress?: (moduleId: ProfileModuleId) => void;
};

export function ProfileNavMenu({ forcedActiveId, onModulePress }: ProfileNavMenuProps) {
  const { theme } = useTheme();
  const activeModuleId = useProfileStore((s) => s.activeModuleId);
  const resolvedActiveId = forcedActiveId ?? activeModuleId;
  const uncollectedXp = useProfileStore((s) => s.uncollectedXpRewards);
  const setActiveModule = useProfileStore((s) => s.setActiveModule);
  const openProfileModule = useProfileModuleStore((s) => s.openModule);

  const handlePress = (
    id: ProfileModuleId,
    tabRoute?: keyof RootTabParamList,
    profileModule?: ProfileMenuItem['profileModule'],
  ) => {
    setActiveModule(id);
    onModulePress?.(id);

    if (tabRoute) {
      navigateTab(tabRoute);
      return;
    }

    if (profileModule) {
      openProfileModule(profileModule);
    }
  };

  const menuItems = isAppFullyFree()
    ? PROFILE_MENU_ITEMS.filter((item) => item.id !== 'premium')
    : PROFILE_MENU_ITEMS;

  return (
    <View className="gap-1">
      {menuItems.map((item) => {
        const isActive = resolvedActiveId === item.id;
        const Icon = item.icon;
        const showXpBadge = item.id === 'achievements' && uncollectedXp > 0;

        return (
          <Pressable
            key={item.id}
            onPress={() => handlePress(item.id, item.tabRoute, item.profileModule)}
            className="active:opacity-85"
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <View
              className={`flex-row items-center px-4 py-3.5 ${
                isActive ? 'rounded-xl' : ''
              }`}
              style={
                isActive
                  ? { backgroundColor: `${theme.primary}26` }
                  : undefined
              }
            >
              <View className="w-9 items-center">
                <Icon
                  color={isActive ? theme.iconActive : theme.iconMuted}
                  size={20}
                  strokeWidth={isActive ? 2.4 : 2}
                />
              </View>

              <Text
                className="ml-3 flex-1 text-base font-semibold"
                style={{ color: isActive ? theme.textPrimary : theme.textSecondary }}
              >
                {item.label}
              </Text>

              {showXpBadge ? (
                <View
                  className="mr-2 rounded-full px-2 py-0.5"
                  style={{ backgroundColor: `${theme.primary}33` }}
                >
                  <Text className="text-[10px] font-bold" style={{ color: theme.primary }}>
                    +{uncollectedXp} XP
                  </Text>
                </View>
              ) : null}

              <ChevronRight color={theme.iconMuted} size={18} strokeWidth={2} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
