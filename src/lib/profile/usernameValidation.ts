export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 16;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

export type UsernameValidationResult =
  | { valid: true; normalized: string }
  | { valid: false; errorKey: string; errorParams?: Record<string, number | string> };

export function normalizeUsernameInput(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, USERNAME_MAX_LENGTH);
}

export function validateUsername(raw: string): UsernameValidationResult {
  const normalized = raw.trim();

  if (!normalized) {
    return { valid: false, errorKey: 'profile.usernameErrors.empty' };
  }

  if (normalized.length < USERNAME_MIN_LENGTH) {
    return {
      valid: false,
      errorKey: 'profile.usernameErrors.tooShort',
      errorParams: { min: USERNAME_MIN_LENGTH },
    };
  }

  if (normalized.length > USERNAME_MAX_LENGTH) {
    return {
      valid: false,
      errorKey: 'profile.usernameErrors.tooLong',
      errorParams: { max: USERNAME_MAX_LENGTH },
    };
  }

  if (!USERNAME_PATTERN.test(normalized)) {
    return {
      valid: false,
      errorKey: 'profile.usernameErrors.invalidChars',
    };
  }

  return { valid: true, normalized };
}

export function mapUsernameUpdateError(error: unknown): {
  errorKey: string;
  errorParams?: Record<string, number | string>;
} {
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
    return { errorKey: 'profile.usernameErrors.taken' };
  }

  if (code === '23514' || message.toLowerCase().includes('username_length_check')) {
    return {
      errorKey: 'profile.usernameErrors.lengthCheck',
      errorParams: { min: USERNAME_MIN_LENGTH, max: USERNAME_MAX_LENGTH },
    };
  }

  return { errorKey: 'profile.usernameErrors.updateFailed' };
}
