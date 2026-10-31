/** Rs. 3,499 — whole rupees, grouped in thousands (FRONTEND.md §1). */
export function formatPKR(amount: number | null | undefined): string {
  const n = Math.round(Number(amount) || 0);
  return `Rs. ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "31 Oct 2026" in the phone's local time. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "31 Oct, 2:15 PM" in the phone's local time. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}

/** +923001234567 → 0300 1234567 for display. */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('92') ? `0${digits.slice(2)}` : digits;
  return local.length === 11 ? `${local.slice(0, 4)} ${local.slice(4)}` : phone;
}
