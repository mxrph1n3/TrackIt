# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Telegram Mini App (Web)

We are porting to **Telegram Mini App** via **React Native Web**. When editing UI in `src/`:

- Verify **react-native-web** compatibility for every component and style.
- Native-only libs (`expo-blur`, `expo-haptics`, etc.) must use `Platform.OS === 'web'` guards or web fallbacks.
- On web, treat blur like Android: solid frosted backgrounds, no `BlurView`.

See `.cursor/rules/telegram-mini-app-web.mdc` for full checklist.

## Deploy (Telegram Mini App)

1. Build static web export: `npm run export:web` → output in `dist/`
2. Host `dist/` on HTTPS (Vercel: connect repo — `vercel.json` is included)
3. Set env vars on the host: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, optional `EXPO_PUBLIC_WEB_APP_URL`
4. Supabase Auth → Redirect URLs: add `https://your-domain.com/auth/callback`
5. BotFather → Mini App URL: `https://your-domain.com`
