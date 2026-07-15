import Constants from 'expo-constants';
import { forwardRef, type PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Platform,
  ScrollView,
  type KeyboardAvoidingViewProps,
  type ScrollViewProps,
} from 'react-native';

type KeyboardControllerModule = typeof import('react-native-keyboard-controller');

// react-native-keyboard-controller requires native code: it is unavailable in
// Expo Go and unnecessary on web (Telegram Mini App), so we fall back to the
// react-native core primitives there.
const isExpoGo = Constants.executionEnvironment === 'storeClient';
const controller: KeyboardControllerModule | null =
  Platform.OS !== 'web' && !isExpoGo
    ? (require('react-native-keyboard-controller') as KeyboardControllerModule)
    : null;

function PassthroughProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export const KeyboardProviderCompat = controller ? controller.KeyboardProvider : PassthroughProvider;

export type KeyboardAwareScrollViewCompatProps = ScrollViewProps & {
  /** Distance between the keyboard and the focused input (native builds only). */
  bottomOffset?: number;
};

const FallbackAwareScrollView = forwardRef<ScrollView, KeyboardAwareScrollViewCompatProps>(
  function FallbackAwareScrollView({ bottomOffset: _bottomOffset, style, ...props }, ref) {
    return (
      <RNKeyboardAvoidingView
        style={style}
        behavior={Platform.OS === 'web' ? undefined : 'padding'}
      >
        <ScrollView ref={ref} style={{ flex: 1 }} {...props} />
      </RNKeyboardAvoidingView>
    );
  },
);

export const KeyboardAwareScrollViewCompat = (controller
  ? controller.KeyboardAwareScrollView
  : FallbackAwareScrollView) as typeof FallbackAwareScrollView;

const FallbackAvoidingView = forwardRef<RNKeyboardAvoidingView, KeyboardAvoidingViewProps>(
  function FallbackAvoidingView({ behavior, ...props }, ref) {
    return (
      <RNKeyboardAvoidingView
        ref={ref}
        behavior={Platform.OS === 'ios' ? behavior : undefined}
        {...props}
      />
    );
  },
);

export const KeyboardAvoidingViewCompat = (controller
  ? controller.KeyboardAvoidingView
  : FallbackAvoidingView) as typeof FallbackAvoidingView;
