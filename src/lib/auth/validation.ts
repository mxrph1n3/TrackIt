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

type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
  error_code?: string;
  msg?: string;
};

function readAuthErrorParts(error: unknown): { message: string; code: string; status: number } {
  if (!error || typeof error !== 'object') {
    return { message: '', code: '', status: 0 };
  }

  const err = error as AuthErrorLike;
  return {
    message: String(err.message ?? err.msg ?? ''),
    code: String(err.code ?? err.error_code ?? '').toLowerCase(),
    status: typeof err.status === 'number' ? err.status : 0,
  };
}

export function toAuthErrorMessage(error: unknown): string {
  const { message, code, status } = readAuthErrorParts(error);
  const normalized = `${code} ${message}`.toLowerCase();

  if (
    code === 'invalid_credentials' ||
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid email or password') ||
    (status === 400 && normalized.includes('invalid'))
  ) {
    return 'Incorrect email or password. Check your details and try again.';
  }

  if (code === 'email_not_confirmed' || normalized.includes('email not confirmed')) {
    return 'Confirm your email before signing in. Check your inbox for the link.';
  }

  if (
    code === 'user_already_exists' ||
    normalized.includes('user already registered') ||
    normalized.includes('already been registered')
  ) {
    return 'An account with this email already exists. Sign in instead.';
  }

  if (
    code === 'validation_failed' ||
    normalized.includes('provider is not enabled') ||
    normalized.includes('unsupported provider')
  ) {
    return 'This sign-in method is not enabled yet. Use email and password, or try again later.';
  }

  if (normalized.includes('network') || normalized.includes('fetch failed')) {
    return 'Network error. Check your connection and try again.';
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (message.trim()) {
    return message;
  }

  return 'Authentication failed. Please try again.';
}
