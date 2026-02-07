import * as fs from 'fs';
import type { ParsedTransaction } from '@shared/types/import';

const VALID_TYPES = ['Forint átutalás', 'Elektronikus bankon belüli átutalás'];

function parseDate(dateStr: string): string {
  // Input: "2025.11.17., hétfő" → Output: "2025-11-17"
  const match = dateStr.match(/(\d{4})\.(\d{2})\.(\d{2})/);
  if (!match) return '';
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function parseAmount(amountStr: string): number {
  // Input: "+7 000,00 HUF" or "-26 017,00 HUF" → Output: 7000 or -26017
  const cleaned = amountStr
    .replace(/\s/g, '')
    .replace(/HUF/i, '')
    .replace(/,/g, '.')
    .trim();
  return Math.round(parseFloat(cleaned));
}

function isPositiveAmount(amountStr: string): boolean {
  return amountStr.trim().startsWith('+');
}

export function parseTransactionCSV(filePath: string): ParsedTransaction[] {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Remove BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }

  const lines = content.split('\n').filter((line) => line.trim() !== '');

  if (lines.length < 2) {
    return [];
  }

  // Skip header row
  const dataLines = lines.slice(1);
  const transactions: ParsedTransaction[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const fields = line.split(';');

    if (fields.length < 9) continue;

    const [type, bookingDate, , reference, amount, source, hint2, hint3, hint4] = fields;

    // Filter: only valid transaction types
    if (!VALID_TYPES.includes(type)) continue;

    // Filter: only positive amounts (incoming transfers)
    if (!isPositiveAmount(amount)) continue;

    const parsedAmount = parseAmount(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) continue;

    // Combine notes from hint3 and hint4
    const notes = [hint3, hint4]
      .filter((h) => h && h.trim() && h.trim() !== '')
      .join(' ')
      .trim();

    transactions.push({
      id: `csv-${i}-${reference}`,
      type,
      date: parseDate(bookingDate),
      reference: reference?.trim() || '',
      amount: parsedAmount,
      source: source?.trim() || '',
      supporterHint: hint2?.trim() || '',
      notes,
    });
  }

  return transactions;
}
