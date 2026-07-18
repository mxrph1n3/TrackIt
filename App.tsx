import 'react-native-gesture-handler';
import 'react-native-reanimated';

import './global.css';

import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthBootScreen } from './src/components/auth/AuthBootScreen';
import { LevelUpModal } from './src/components/gamification/LevelUpModal';
import { SubscriptionBootstrap } from './src/components/subscription/SubscriptionBootstrap';
import { WebBootErrorBoundary } from './src/components/system/WebBootErrorBoundary';
import { TelegramBootstrap } from './src/components/telegram/TelegramBootstrap';
import { TmaAccessBootstrap } from './src/components/telegram/TmaAccessBootstrap';
import { AuthProvider } from './src/hooks/useAuth';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthScreen } from './src/screens/AuthScreen';
import { WelcomeGateScreen } from './src/screens/WelcomeGateScreen';
import { completeOAuthSessionFromCurrentUrl } from './src/lib/auth/oauth';
import { tryTelegramAutoSignIn } from './src/lib/auth/telegramAuthService';
import { IS_WEB } from './src/lib/platform/constants';
import { KeyboardProviderCompat } from './src/lib/platform/keyboard';
import { supabase } from './src/lib/supabase';
import { useGamificationStore } from './src/stores/useGamificationStore';
import { AppThemeRoot } from './src/theme/AppThemeRoot';

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden on web / fast refresh.
});


const WELCOME_BACKGROUND_LIGHT = require('./assets/images/welcome-gate.png');
const WELCOME_BACKGROUND_DARK = require('./assets/images/welcome-gate-dark.png');

function AuthGuardRoot() {
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [showWelcomeGate, setShowWelcomeGate] = useState(false);
  const welcomeDismissedRef = useRef(false);

  const presentWelcomeGate = () => {
    if (!welcomeDismissedRef.current) {
      setShowWelcomeGate(true);
    }
  };

  const handleWelcomeEnter = () => {
    welcomeDismissedRef.current = true;
    setShowWelcomeGate(false);
  };

  const handleAuthSession = (session: Session | null, event?: AuthChangeEvent) => {
    if (!session?.user?.id) {
      welcomeDismissedRef.current = false;
      setShowWelcomeGate(false);
      return;
    }

    if (event === 'SIGNED_IN') {
      welcomeDismissedRef.current = false;
    }

    if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      return;
    }

    presentWelcomeGate();
    void useGamificationStore.getState().initialize();
  };

  useEffect(() => {
    if (IS_WEB) {
      return;
    }
    void Image.prefetch(Image.resolveAssetSource(WELCOME_BACKGROUND_LIGHT).uri);
    void Image.prefetch(Image.resolveAssetSource(WELCOME_BACKGROUND_DARK).uri);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      if (IS_WEB) {
        await completeOAuthSessionFromCurrentUrl();
      }

      let { data, error } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }

      if (!data.session) {
        await tryTelegramAutoSignIn();
        ({ data, error } = await supabase.auth.getSession());
        if (!isMounted) {
          return;
        }
      }

      if (error) {
        console.warn('[AuthGuard] Failed to restore session:', error.message);
      }

      setUserSession(data.session);
      setIsLoading(false);
      handleAuthSession(data.session);
      void SplashScreen.hideAsync().catch(() => undefined);
    };

    void bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setUserSession(nextSession);
      setIsLoading(false);
      void SplashScreen.hideAsync().catch(() => undefined);
      handleAuthSession(nextSession, event);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthProvider session={userSession}>
      {isLoading ? (
        <AuthBootScreen />
      ) : userSession ? (
        showWelcomeGate ? (
          <WelcomeGateScreen onEnter={handleWelcomeEnter} />
        ) : (
          <>
            <AppNavigator />
            <SubscriptionBootstrap />
            <TmaAccessBootstrap />
            <LevelUpModal />
          </>
        )
      ) : (
        <AuthScreen />
      )}
    </AuthProvider>
  );
}

export default function App() {
  const RootWrapper = Platform.OS === 'web' ? View : GestureHandlerRootView;

  const tree = (
    <RootWrapper style={styles.root}>
      <KeyboardProviderCompat>
        <SafeAreaProvider>
          <TelegramBootstrap />
          <AppThemeRoot>
            <AuthGuardRoot />
          </AppThemeRoot>
        </SafeAreaProvider>
      </KeyboardProviderCompat>
    </RootWrapper>
  );

  if (IS_WEB) {
    return <WebBootErrorBoundary>{tree}</WebBootErrorBoundary>;
  }

  return tree;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
