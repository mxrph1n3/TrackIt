import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { APP_LOCALES, LOCALE_LABELS, type LocalePreference } from '../../i18n';
import { useLocaleStore } from '../../stores/useLocaleStore';
import { useTheme } from '../../theme/ThemeContext';

const OPTIONS: LocalePreference[] = ['system', ...APP_LOCALES];

/** Compact language chips — Settings + profile drawer. */
export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const preference = useLocaleStore((s) => s.preference);
  const setPreference = useLocaleStore((s) => s.setPreference);

  return (
    <View>
      {!compact ? (
        <Text className="mt-2 text-sm" style={{ color: theme.textSecondary }}>
          {t('settings.languageHint')}
        </Text>
      ) : null}
      <View className={`flex-row flex-wrap gap-2 ${compact ? '' : 'mt-3'}`}>
        {OPTIONS.map((id) => {
          const active = preference === id;
          const label = id === 'system' ? t('common.system') : LOCALE_LABELS[id];
          return (
            <Pressable
              key={id}
              onPress={() => void setPreference(id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className="rounded-full px-3 py-2"
              style={{
                backgroundColor: active ? theme.primary : `${theme.primary}12`,
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: active ? '#0B1220' : theme.textMuted }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
