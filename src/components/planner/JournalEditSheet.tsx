import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { usePlannerTheme } from '../../hooks/usePlannerTheme';
import { BRAND } from '../../theme/designTokens';

type JournalEditSheetProps = {
  visible: boolean;
  initialBody?: string;
  onClose: () => void;
  onSave: (body: string) => Promise<void>;
};

export function JournalEditSheet({
  visible,
  initialBody = '',
  onClose,
  onSave,
}: JournalEditSheetProps) {
  const insets = useAppSafeAreaInsets();
  const { theme } = usePlannerTheme();
  const [body, setBody] = useState(initialBody);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: theme.drawerBackdrop,
        },
        sheet: {
          backgroundColor: theme.cardFrosted,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 20,
          paddingTop: 20,
        },
        title: {
          fontSize: 18,
          fontWeight: '800',
          color: theme.textPrimary,
          marginBottom: 12,
        },
        input: {
          minHeight: 160,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 16,
          lineHeight: 24,
          color: theme.textPrimary,
        },
        error: {
          marginTop: 10,
          color: '#F87171',
          fontSize: 13,
        },
        actions: {
          flexDirection: 'row',
          gap: 10,
          marginTop: 16,
        },
        secondaryBtn: {
          flex: 1,
          alignItems: 'center',
          paddingVertical: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
        },
        secondaryLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        primaryBtn: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 14,
          borderRadius: 14,
          backgroundColor: BRAND.primary,
          minHeight: 48,
        },
        primaryBtnDisabled: {
          opacity: 0.6,
        },
        primaryLabel: {
          fontSize: 14,
          fontWeight: '700',
          color: '#FFFFFF',
        },
      }),
    [theme],
  );

  useEffect(() => {
    if (visible) {
      setBody(initialBody);
      setError(null);
    }
  }, [initialBody, visible]);

  const handleSave = async () => {
    const trimmed = body.trim();
    if (!trimmed || isSaving) {
      setError('Write something before saving.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(trimmed);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save journal entry.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.title}>Journal Entry</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Reflect on your day..."
            placeholderTextColor={theme.textMuted}
            multiline
            textAlignVertical="top"
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.secondaryBtn}>
              <Text style={styles.secondaryLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => void handleSave()}
              disabled={isSaving}
              style={[styles.primaryBtn, isSaving && styles.primaryBtnDisabled]}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryLabel}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
