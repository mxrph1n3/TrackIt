export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 16;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

export type UsernameValidationResult =
  | { valid: true; normalized: string }
  | { valid: false; error: string };

export function normalizeUsernameInput(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, USERNAME_MAX_LENGTH);
}

export function validateUsername(raw: string): UsernameValidationResult {
  const normalized = raw.trim();

  if (!normalized) {
    return { valid: false, error: 'Username cannot be empty.' };
  }

  if (normalized.length < USERNAME_MIN_LENGTH) {
    return {
      valid: false,
      error: `Username must be at least ${USERNAME_MIN_LENGTH} characters.`,
    };
  }

  if (normalized.length > USERNAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `Username must be ${USERNAME_MAX_LENGTH} characters or fewer.`,
    };
  }

  if (!USERNAME_PATTERN.test(normalized)) {
    return {
      valid: false,
      error: 'Use letters, numbers, underscores, or dashes only.',
    };
  }

  return { valid: true, normalized };
}

export function mapUsernameUpdateError(error: unknown): string {
  const message =
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
      ? (error as { message: string }).message
      : '';

  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
      ? (error as { code: string }).code
      : '';

  if (code === '23505' || message.toLowerCase().includes('unique')) {
    return 'This username is already taken.';
  }

  if (code === '23514' || message.toLowerCase().includes('username_length_check')) {
    return `Username must be ${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} characters.`;
  }

  if (message) {
    return message;
  }

  return 'Could not update username. Try again.';
}
