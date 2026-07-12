import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { useTheme } from '../../theme/ThemeContext';

type AuthTextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AuthTextField({
  label,
  error,
  onFocus,
  onBlur,
  className,
  ...props
}: AuthTextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);

  return (
    <View className="mb-4">
      <Text
        className="mb-2 text-[11px] font-semibold tracking-wide"
        style={{ color: theme.textMuted }}
      >
        {label}
      </Text>
      <TextInput
        {...props}
        placeholderTextColor={theme.textMuted}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        className={`rounded-2xl border px-4 py-3.5 text-[15px] ${
          error
            ? 'border-finance-red/60'
            : isFocused
              ? 'border-obsidian-primary'
              : 'border-obsidian-border/70'
        } ${className ?? ''}`}
        style={[
          {
            backgroundColor: surfaces.inset,
            color: theme.textPrimary,
          },
          isFocused && !error
            ? {
                shadowColor: '#775DD8',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.22,
                shadowRadius: 12,
              }
            : undefined,
        ]}
      />
      {error ? <Text className="mt-1.5 text-xs text-finance-red">{error}</Text> : null}
    </View>
  );
}
