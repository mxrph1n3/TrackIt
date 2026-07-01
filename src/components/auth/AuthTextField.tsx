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
      <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
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
        className={`rounded-xl border px-4 py-3.5 text-base text-ethereal-ink ${
          error
            ? 'border-finance-red/60'
            : isFocused
              ? 'border-obsidian-primary'
              : 'border-obsidian-border'
        } ${className ?? ''}`}
        style={[
          { backgroundColor: surfaces.inset },
          isFocused && !error
            ? {
                shadowColor: '#775DD8',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
              }
            : undefined,
        ]}
      />
      {error ? <Text className="mt-1.5 text-xs text-finance-red">{error}</Text> : null}
    </View>
  );
}
