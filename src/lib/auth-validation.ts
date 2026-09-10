const PHONE_PATTERN = /^1[3-9]\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CODE_PATTERN = /^\d{6}$/;

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(value);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidCode(value: string): boolean {
  return CODE_PATTERN.test(value);
}

export function isValidPassword(value: string): boolean {
  return value.length >= 6 && value.length <= 128;
}
