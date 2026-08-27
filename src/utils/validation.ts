/**
 * Validates Pakistani mobile phone numbers
 * Accepts formats: 03001234567, 0300-1234567, +923001234567, 923001234567
 */
export function isValidPakistaniPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s-]/g, '');
  const regex = /^((\+92)?(0)?(3[0-9]{2}))([0-9]{7})$/;
  return regex.test(cleaned);
}

/**
 * Validates standard email address
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Sanitizes text input by removing dangerous/script injection characters
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Validates required text with minimum length
 */
export function isRequired(value: string | null | undefined, minLength = 1): boolean {
  if (!value) return false;
  return value.trim().length >= minLength;
}
