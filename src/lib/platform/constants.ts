import { Platform } from 'react-native';

/** True when running in React Native Web / Expo web. */
export const IS_WEB = Platform.OS === 'web';

/** True on iOS or Android native builds. */
export const IS_NATIVE = Platform.OS === 'ios' || Platform.OS === 'android';

/** Native iOS blur via expo-blur (not available on web/Android). */
export const SUPPORTS_NATIVE_BLUR = Platform.OS === 'ios';

/** Reanimated layout enter/exit — reliable on iOS only; use static fallbacks elsewhere. */
export const SUPPORTS_LAYOUT_ANIMATIONS = Platform.OS === 'ios';
