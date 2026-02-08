export interface ExportOptions {
  from?: string;
  to?: string;
  format: 'csv' | 'xlsx';
}

export interface ExportResult {
  filePath: string;
  count: number;
}
