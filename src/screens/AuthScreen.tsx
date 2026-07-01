import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Apple, Sparkles } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthTextField } from '../components/auth/AuthTextField';
import { isAppleSignInAvailable } from '../lib/auth/apple';
import { validateAuthForm, type AuthFieldErrors } from '../lib/auth/validation';
import { useAuth } from '../hooks/useAuth';
import { getThemedSurfaces } from '../theme/themedSurfaces';
import { useTheme } from '../theme/ThemeContext';

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);
  const {
    isAuthenticating,
    authError,
    clearAuthError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
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

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0 && !isAuthenticating,
    [email, isAuthenticating, password],
  );

  const handleSignIn = async () => {
    const errors = validateAuthForm(email, password, 'sign-in');
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      return;
    }
    await signInWithEmail(email, password);
  };

  const handleSignUp = async () => {
    const errors = validateAuthForm(email, password, 'sign-up');
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      return;
    }
    await signUpWithEmail(email, password);
  };

  return (
    <View className="flex-1 bg-ethereal-base">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 20,
            justifyContent: 'center',
          }}
        >
          <View className="mb-8 items-center">
            <LinearGradient
              colors={['#9580E8', '#775DD8', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                shadowColor: '#775DD8',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.55,
                shadowRadius: 18,
              }}
            >
              <Sparkles color="#FFFFFF" size={32} strokeWidth={2.2} />
            </LinearGradient>
            <Text className="text-2xl font-black tracking-[0.25em] text-ethereal-ink">ZENITH</Text>
            <Text className="mt-2 text-center text-sm text-ethereal-slate">
              Focus · Discipline · Freedom
            </Text>
          </View>

          <View className="overflow-hidden rounded-3xl border border-ethereal-glass-border bg-ethereal-glass">
            <BlurView intensity={theme.blurIntensity} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
            <View className="p-6" style={{ backgroundColor: theme.cardFrosted }}>
              <Text className="text-center text-[11px] font-bold uppercase tracking-[0.35em] text-ethereal-ink">
                Welcome Back
              </Text>
              <Text className="mt-2 text-center text-sm text-ethereal-slate">
                Sign in to sync your Life OS progress
              </Text>

              <View className="mt-6">
                <AuthTextField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  placeholder="you@zenith.app"
                  error={fieldErrors.email}
                />

                <AuthTextField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType="password"
                  placeholder="Enter your password"
                  error={fieldErrors.password}
                />
              </View>

              {authError ? (
                <View className="mb-4 rounded-xl border border-finance-red/30 bg-finance-red/10 px-3 py-2.5">
                  <Text className="text-sm text-finance-red">{authError}</Text>
                </View>
              ) : null}

              <View className="gap-3">
                <Pressable
                  onPress={handleSignIn}
                  disabled={!canSubmit}
                  className="active:opacity-85"
                >
                  <LinearGradient
                    colors={['#9580E8', '#775DD8', '#6366F1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 14,
                      paddingVertical: 14,
                      alignItems: 'center',
                      opacity: canSubmit ? 1 : 0.55,
                    }}
                  >
                    <Text className="text-sm font-bold text-white">Sign In</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={handleSignUp}
                  disabled={!canSubmit}
                  className="items-center rounded-xl border border-obsidian-primary/35 bg-obsidian-primary/10 py-3.5 active:opacity-85"
                  style={{ opacity: canSubmit ? 1 : 0.55 }}
                >
                  <Text className="text-sm font-bold text-obsidian-primary">Sign Up</Text>
                </Pressable>
              </View>

              <View className="my-6 flex-row items-center">
                <View className="h-px flex-1 bg-ethereal-glass-border" />
                <Text className="mx-3 text-[10px] font-semibold uppercase tracking-widest text-ethereal-slate">
                  Or continue with
                </Text>
                <View className="h-px flex-1 bg-ethereal-glass-border" />
              </View>

              <View className="gap-3">
                <Pressable
                  onPress={() => void signInWithGoogle()}
                  disabled={isAuthenticating}
                  className="flex-row items-center justify-center rounded-xl border border-obsidian-border py-3.5 active:opacity-85"
                  style={{ backgroundColor: surfaces.chip }}
                >
                  <View className="mr-2 h-6 w-6 items-center justify-center rounded-full bg-white">
                    <Text className="text-xs font-black text-[#4285F4]">G</Text>
                  </View>
                  <Text className="text-sm font-semibold text-ethereal-ink">Sign in with Google</Text>
                </Pressable>

                {appleAvailable ? (
                  <Pressable
                    onPress={() => void signInWithApple()}
                    disabled={isAuthenticating}
                  className="flex-row items-center justify-center rounded-xl border border-ethereal-glass-border py-3.5 active:opacity-85"
                  style={{ backgroundColor: surfaces.chipStrong }}
                >
                  <Apple color={theme.textPrimary} size={18} />
                    <Text className="ml-2 text-sm font-semibold text-ethereal-ink">
                      Sign in with Apple
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isAuthenticating ? (
        <View className="absolute inset-0 items-center justify-center bg-black/45">
          <View className="overflow-hidden rounded-2xl border border-[rgba(168,85,247,0.2)]">
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <View className="items-center bg-[rgba(20,20,27,0.75)] px-8 py-6">
              <ActivityIndicator color="#775DD8" size="large" />
              <Text className="mt-3 text-sm font-semibold text-white">Authenticating...</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
