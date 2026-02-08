import fs from 'node:fs';
import type { DonationWithSupporter } from '@shared/types/donation';

const SEPARATOR = ';';
const BOM = '\uFEFF';

const COLUMNS = [
  'Támogató',
  'Összeg',
  'Pénznem',
  'Dátum',
  'Fizetési mód',
  'Hivatkozás',
  'Megjegyzés',
];

function escapeField(value: string): string {
  if (value.includes(SEPARATOR) || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToCSV(donations: DonationWithSupporter[], filePath: string): void {
  const lines: string[] = [COLUMNS.join(SEPARATOR)];

  for (const d of donations) {
    const row = [
      d.supporter_name,
      String(d.amount),
      d.currency,
      d.donation_date,
      d.payment_method ?? '',
      d.reference ?? '',
      d.notes ?? '',
    ].map(escapeField);

    lines.push(row.join(SEPARATOR));
  }

  fs.writeFileSync(filePath, BOM + lines.join('\r\n'), 'utf-8');
}
