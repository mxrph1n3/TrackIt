-- Username length + character validation (2–16, alphanumeric / _ / -)
-- Safe to re-run in SQL Editor.

alter table public.profiles
drop constraint if exists username_length_check;

alter table public.profiles
add constraint username_length_check
check (
  char_length(trim(username)) >= 2
  and char_length(trim(username)) <= 16
  and trim(username) ~ '^[a-zA-Z0-9_-]+$'
);

-- Existing policy "Users can update safe profile fields" already allows username
-- updates while blocking direct level/xp writes. No duplicate UPDATE policy needed.
