-- Paste into Supabase SQL Editor (username validation constraint)
-- Existing RLS policy "Users can update safe profile fields" covers username updates.

alter table public.profiles
drop constraint if exists username_length_check;

alter table public.profiles
add constraint username_length_check
check (
  char_length(trim(username)) >= 2
  and char_length(trim(username)) <= 16
  and trim(username) ~ '^[a-zA-Z0-9_-]+$'
);
