export type AuthFieldErrors = {
  email?: string;
  password?: string;
  form?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  const value = email.trim();

  if (!value) {
    return 'Email is required.';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Enter a valid email address.';
  }

  return undefined;
}

export function validatePassword(password: string, mode: 'sign-in' | 'sign-up'): string | undefined {
  if (!password) {
    return 'Password is required.';
  }

  if (mode === 'sign-in' && password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  if (mode === 'sign-up' && password.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  if (mode === 'sign-up' && !/[A-Za-z]/.test(password)) {
    return 'Password must include at least one letter.';
  }

  if (mode === 'sign-up' && !/[0-9]/.test(password)) {
    return 'Password must include at least one number.';
  }

  return undefined;
}

export function validateAuthForm(
  email: string,
  password: string,
  mode: 'sign-in' | 'sign-up',
): AuthFieldErrors {
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password, mode);

  if (emailError || passwordError) {
    return {
      email: emailError,
      password: passwordError,
    };
  }

  return {};
}

export function toAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Authentication failed. Please try again.';
}
