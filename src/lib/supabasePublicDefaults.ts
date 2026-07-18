/**
 * Public Supabase client defaults (anon key is designed to ship in the app).
 * Used when EXPO_PUBLIC_* were not inlined at bundle time (e.g. Archive without `.env`).
 * Override via `.env` / `.env.production` when present.
 */
export const DEFAULT_SUPABASE_URL = 'https://vvdakzkcfnmczddukgtg.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZGFremtjZm5tY3pkZHVrZ3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTk3OTYsImV4cCI6MjA5ODA3NTc5Nn0.UNcQpNbgTER-PTfqnXRimfqM4IYYw7wzgZzdvEwFij0';
