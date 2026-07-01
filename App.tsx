import 'react-native-gesture-handler';
import 'react-native-reanimated';

import './global.css';

import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthBootScreen } from './src/components/auth/AuthBootScreen';
import { LevelUpModal } from './src/components/gamification/LevelUpModal';
import { SubscriptionBootstrap } from './src/components/subscription/SubscriptionBootstrap';
import { AuthProvider } from './src/hooks/useAuth';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthScreen } from './src/screens/AuthScreen';
import { WelcomeGateScreen } from './src/screens/WelcomeGateScreen';
import { supabase } from './src/lib/supabase';
import { useGamificationStore } from './src/stores/useGamificationStore';
import { AppThemeRoot } from './src/theme/AppThemeRoot';


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
    void Image.prefetch(Image.resolveAssetSource(WELCOME_BACKGROUND_LIGHT).uri);
    void Image.prefetch(Image.resolveAssetSource(WELCOME_BACKGROUND_DARK).uri);
  }, []);

  useEffect(() => {
    let isMounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        console.warn('[AuthGuard] Failed to restore session:', error.message);
      }

      setUserSession(data.session);
      setIsLoading(false);
      handleAuthSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setUserSession(nextSession);
      setIsLoading(false);
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
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppThemeRoot>
          <AuthGuardRoot />
        </AppThemeRoot>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
