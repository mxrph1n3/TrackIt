import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  normalizeUsernameInput,
  USERNAME_MAX_LENGTH,
  validateUsername,
} from '../../lib/profile/usernameValidation';
import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { useTheme } from '../../theme/ThemeContext';
import { DismissibleOverlay } from '../ui/DismissibleOverlay';

const LIGHT_PANEL_GRADIENT = ['rgba(255,255,255,0.98)', 'rgba(243,245,250,0.96)', '#F3F5FA'] as const;
const DARK_PANEL_GRADIENT = ['rgba(28, 24, 48, 0.98)', 'rgba(22, 18, 38, 0.96)', '#12101F'] as const;

type UsernameEditModalProps = {
  visible: boolean;
  currentUsername: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (username: string) => Promise<{ success: boolean; error: string | null }>;
};

export function UsernameEditModal({
  visible,
  currentUsername,
  isSaving,
  onClose,
  onSave,
}: UsernameEditModalProps) {
  const insets = useAppSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);
  const [draft, setDraft] = useState(currentUsername);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDraft(currentUsername);
      setError(null);
    }
  }, [visible, currentUsername]);

  const handleSave = async () => {
    const validation = validateUsername(draft);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    if (validation.normalized === currentUsername.trim()) {
      onClose();
      return;
    }

    setError(null);
    const result = await onSave(validation.normalized);
    if (result.success) {
      onClose();
      return;
    }

    setError(result.error ?? 'Could not update username.');
  };

  return (
    <DismissibleOverlay
      visible={visible}
      onDismiss={onClose}
      disabled={isSaving}
      placement="center"
      isolateContent
      accessibilityLabel="Close username editor"
      contentStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="w-full overflow-hidden rounded-3xl border border-[rgba(168,85,247,0.35)]">
        <LinearGradient
          colors={isDark ? [...DARK_PANEL_GRADIENT] : [...LIGHT_PANEL_GRADIENT]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ padding: 24 }}
        >
          <Text className="text-center text-[11px] font-bold uppercase tracking-[0.35em] text-obsidian-primary">
            Edit Username
          </Text>
          <Text className="mt-2 text-center text-xs text-ethereal-slate">
            2–16 characters · letters, numbers, _ and -
          </Text>

          <View className="relative mt-5">
            <TextInput
              value={draft}
              onChangeText={(value) => {
                setDraft(normalizeUsernameInput(value));
                if (error) {
                  setError(null);
                }
              }}
              editable={!isSaving}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={USERNAME_MAX_LENGTH}
              placeholder="Enter username"
              placeholderTextColor={theme.textMuted}
              className="rounded-2xl border border-obsidian-primary/30 px-4 py-3.5 text-center text-lg font-black tracking-[0.15em] text-ethereal-ink"
              style={{
                backgroundColor: surfaces.inset,
                textShadowColor: 'rgba(119, 93, 216, 0.12)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 6,
              }}
              accessibilityLabel="Username input"
            />

            {isSaving ? (
              <View
                className="absolute inset-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.5)' }}
              >
                <ActivityIndicator color="#775DD8" />
              </View>
            ) : null}
          </View>

          {error ? (
            <Text className="mt-3 text-center text-xs font-semibold text-[#F87171]">{error}</Text>
          ) : null}

          <View className="mt-6 flex-row gap-3">
            <Pressable
              onPress={onClose}
              disabled={isSaving}
              className="flex-1 active:opacity-85"
              accessibilityRole="button"
              accessibilityLabel="Cancel username edit"
            >
              <View
                className="items-center rounded-xl border border-ethereal-glass-border py-3.5"
                style={{ backgroundColor: surfaces.chip }}
              >
                <Text className="text-sm font-bold text-ethereal-slate">Cancel</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => void handleSave()}
              disabled={isSaving}
              className="flex-1 active:scale-[0.98]"
              accessibilityRole="button"
              accessibilityLabel="Save username"
            >
              <LinearGradient
                colors={['#9580E8', '#775DD8', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                <Text className="text-sm font-bold text-white">Save</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </DismissibleOverlay>
  );
}
