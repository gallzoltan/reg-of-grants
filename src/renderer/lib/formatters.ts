import type { SupporterEmail, SupporterPhone } from '@shared/types/supporter';

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}. ${month}. ${day}.`;
}

export function formatEmailList(emails: SupporterEmail[]): string {
  if (emails.length === 0) return '—';
  return emails
    .sort((a, b) => b.is_primary - a.is_primary)
    .map((e) => e.email)
    .join(', ');
}

export function formatPhoneList(phones: SupporterPhone[]): string {
  if (phones.length === 0) return '—';
  return phones
    .sort((a, b) => b.is_primary - a.is_primary)
    .map((p) => p.phone)
    .join(', ');
}
