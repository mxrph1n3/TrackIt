import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthHeroMark } from '../components/auth/AuthHeroMark';
import { AuthModeTabs, type AuthMode } from '../components/auth/AuthModeTabs';
import { AuthSocialRow } from '../components/auth/AuthSocialRow';
import { AuthTextField } from '../components/auth/AuthTextField';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { useAppSafeAreaInsets } from '../hooks/useAppSafeAreaInsets';
import { isAppleSignInAvailable } from '../lib/auth/apple';
import { validateAuthForm, type AuthFieldErrors } from '../lib/auth/validation';
import { useAuth } from '../hooks/useAuth';
import { MIN_ACCOUNT_AGE } from '../constants/disclaimers';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '../constants/legal';
import { supportsNativeBlur } from '../lib/platform/blur';
import { triggerHaptic } from '../lib/platform/haptics';
import { useTheme } from '../theme/ThemeContext';

export function AuthScreen() {
  const insets = useAppSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const {
    isAuthenticating,
    authError,
    clearAuthError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    void isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  useEffect(() => {
    if (!email && !password) {
      return;
    }
    clearAuthError();
  }, [clearAuthError, email, password]);

  useEffect(() => {
    setAgeConfirmed(false);
    setAgeError(null);
  }, [mode]);

  const canSubmit = useMemo(() => {
    if (email.trim().length === 0 || password.length === 0 || isAuthenticating) {
      return false;
    }
    if (mode === 'sign-up' && !ageConfirmed) {
      return false;
    }
    return true;
  }, [ageConfirmed, email, isAuthenticating, mode, password]);

  const ensureAgeConfirmed = () => {
    if (mode !== 'sign-up' || ageConfirmed) {
      setAgeError(null);
      return true;
    }
    setAgeError(`You must be at least ${MIN_ACCOUNT_AGE} years old to create an account.`);
    return false;
  };

  const ensureAgeConfirmedForSocial = () => {
    if (ageConfirmed) {
      setAgeError(null);
      return true;
    }
    setAgeError(`Confirm you are at least ${MIN_ACCOUNT_AGE} before using Google or Apple sign-in.`);
    return false;
  };

  const handleSubmit = async () => {
    const errors = validateAuthForm(email, password, mode);
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      return;
    }
    if (!ensureAgeConfirmed()) {
      return;
    }
    void triggerHaptic('medium');
    if (mode === 'sign-in') {
      await signInWithEmail(email, password);
    } else {
      await signUpWithEmail(email, password);
    }
  };

  const headline = mode === 'sign-in' ? 'Welcome back' : 'Start your orbit';
  const subline =
    mode === 'sign-in'
      ? 'Pick up where you left off — sync focus, health and habits.'
      : 'Create your account and build your daily command center.';

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AmbientBackground />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 28,
            paddingHorizontal: 22,
            justifyContent: 'center',
          }}
        >
          <AuthHeroMark />

          <Animated.View entering={FadeInDown.duration(420).delay(80)}>
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(149,128,232,0.45)', 'rgba(99,102,241,0.28)', 'rgba(149,128,232,0.2)']
                  : ['rgba(149,128,232,0.55)', 'rgba(99,102,241,0.35)', 'rgba(201,187,255,0.45)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardBorder}
            >
              <View style={[styles.card, { backgroundColor: isDark ? 'rgba(16,14,28,0.82)' : 'rgba(255,255,255,0.78)' }]}>
                {supportsNativeBlur() ? (
                  <BlurView intensity={isDark ? 24 : 32} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
                ) : null}

                <View style={styles.cardInner}>
                  <AuthModeTabs mode={mode} onChange={setMode} />

                  <Text style={[styles.headline, { color: theme.ink }]}>{headline}</Text>
                  <Text style={[styles.subline, { color: theme.textSecondary }]}>{subline}</Text>

                  <View style={styles.fields}>
                    <AuthTextField
                      label="Email"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      placeholder="you@trackit.app"
                      error={fieldErrors.email}
                    />

                    <AuthTextField
                      label="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      textContentType={mode === 'sign-up' ? 'newPassword' : 'password'}
                      placeholder={mode === 'sign-up' ? 'At least 8 characters' : 'Your password'}
                      error={fieldErrors.password}
                    />
                  </View>

                  <Pressable
                      onPress={() => {
                        setAgeConfirmed((prev) => !prev);
                        setAgeError(null);
                      }}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: ageConfirmed }}
                      style={styles.ageRow}
                    >
                      <View
                        style={[
                          styles.ageCheckbox,
                          {
                            borderColor: ageError ? '#EF4444' : theme.borderSubtle,
                            backgroundColor: ageConfirmed ? '#775DD8' : 'transparent',
                          },
                        ]}
                      >
                        {ageConfirmed ? <Text style={styles.ageCheckmark}>✓</Text> : null}
                      </View>
                      <Text style={[styles.ageLabel, { color: theme.textSecondary }]}>
                        I confirm I am at least {MIN_ACCOUNT_AGE} years old
                      </Text>
                    </Pressable>

                  {ageError ? (
                    <View style={styles.errorBanner}>
                      <Text style={styles.errorText}>{ageError}</Text>
                    </View>
                  ) : null}

                  {authError ? (
                    <View style={styles.errorBanner}>
                      <Text style={styles.errorText}>{authError}</Text>
                    </View>
                  ) : null}

                  <Pressable
                    onPress={() => void handleSubmit()}
                    disabled={!canSubmit}
                    style={({ pressed }) => [{ opacity: !canSubmit ? 0.5 : pressed ? 0.9 : 1 }]}
                  >
                    <LinearGradient
                      colors={['#B8A8F8', '#9580E8', '#775DD8', '#6366F1']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryLabel}>
                        {mode === 'sign-in' ? 'Enter TrackIt' : 'Create my account'}
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  <AuthSocialRow
                    appleAvailable={appleAvailable}
                    disabled={isAuthenticating}
                    onGoogle={() => {
                      if (!ensureAgeConfirmedForSocial()) return;
                      void signInWithGoogle();
                    }}
                    onApple={() => {
                      if (!ensureAgeConfirmedForSocial()) return;
                      void signInWithApple();
                    }}
                  />
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          <View style={styles.legalRow}>
            <Pressable onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}>
              <Text style={[styles.legalLink, { color: theme.textMuted }]}>Privacy Policy</Text>
            </Pressable>
            <Text style={[styles.legalDivider, { color: theme.textMuted }]}>·</Text>
            <Pressable onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)}>
              <Text style={[styles.legalLink, { color: theme.textMuted }]}>Terms of Service</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isAuthenticating ? (
        <View style={styles.loadingScrim}>
          <View style={styles.loadingCard}>
            {supportsNativeBlur() ? (
              <BlurView intensity={28} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
            ) : null}
            <View
              style={[
                styles.loadingInner,
                { backgroundColor: isDark ? 'rgba(20,18,32,0.88)' : 'rgba(255,255,255,0.9)' },
              ]}
            >
              <ActivityIndicator color="#775DD8" size="large" />
              <Text style={[styles.loadingText, { color: theme.textPrimary }]}>Syncing your orbit…</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  cardBorder: {
    borderRadius: 30,
    padding: 1,
    marginTop: 8,
  },
  card: {
    borderRadius: 29,
    overflow: 'hidden',
  },
  cardInner: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subline: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  fields: {
    marginTop: 22,
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
  },
  ageCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  ageCheckmark: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ageLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  legalLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  legalDivider: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBanner: {
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.28)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#775DD8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  primaryLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  loadingScrim: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 8, 18, 0.42)',
  },
  loadingCard: {
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(149, 128, 232, 0.28)',
  },
  loadingInner: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 26,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});
