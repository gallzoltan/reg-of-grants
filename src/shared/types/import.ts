export interface ParsedTransaction {
  id: string;
  type: string;
  date: string;
  reference: string;
  amount: number;
  source: string;
  supporterHint: string;
  notes: string;
}
