/**
 * Formats a number into Pakistani Rupee currency string (e.g., Rs. 2,499)
 */
export function formatPKR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rs. 0';
  }
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
}

/**
 * Calculates percentage discount between original price and current price
 */
export function calculateDiscount(originalPrice?: number, currentPrice?: number): number {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Formats standard Pakistani phone number for display (e.g., 0300 1234567)
 */
export function formatPakistaniPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('92') && cleaned.length === 12) {
    return `+92 ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }
  return phone;
}

/**
 * Returns formatted date string (e.g., 27 Aug 2026, 04:30 PM)
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

/**
 * Generates unique ID with prefix
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
