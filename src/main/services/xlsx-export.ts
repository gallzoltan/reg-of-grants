import ExcelJS from 'exceljs';
import type { DonationWithSupporter } from '@shared/types/donation';

const COLUMNS: { header: string; key: string; width: number }[] = [
  { header: 'Támogató', key: 'supporter_name', width: 28 },
  { header: 'Összeg', key: 'amount', width: 16 },
  { header: 'Pénznem', key: 'currency', width: 10 },
  { header: 'Dátum', key: 'donation_date', width: 14 },
  { header: 'Fizetési mód', key: 'payment_method', width: 16 },
  { header: 'Hivatkozás', key: 'reference', width: 20 },
  { header: 'Megjegyzés', key: 'notes', width: 30 },
];

export async function exportToXLSX(donations: DonationWithSupporter[], filePath: string): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Támogatások');

  sheet.columns = COLUMNS;

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };
  headerRow.alignment = { vertical: 'middle' };

  for (const d of donations) {
    sheet.addRow({
      supporter_name: d.supporter_name,
      amount: d.amount,
      currency: d.currency,
      donation_date: d.donation_date,
      payment_method: d.payment_method ?? '',
      reference: d.reference ?? '',
      notes: d.notes ?? '',
    });
  }

  // Number format for amount column
  sheet.getColumn('amount').numFmt = '#,##0';

  await workbook.xlsx.writeFile(filePath);
}
