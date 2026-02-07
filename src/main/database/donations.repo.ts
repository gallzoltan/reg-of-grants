import { getDatabase } from './connection';
import type {
  Donation,
  DonationWithSupporter,
  CreateDonationInput,
  UpdateDonationInput,
} from '@shared/types/donation';

export function create(input: CreateDonationInput): Donation {
  const db = getDatabase();
  const result = db
    .prepare(
      `INSERT INTO donations (supporter_id, amount, currency, donation_date, payment_method, reference, notes, source)
       VALUES (@supporter_id, @amount, @currency, @donation_date, @payment_method, @reference, @notes, @source)`,
    )
    .run({
      supporter_id: input.supporter_id,
      amount: input.amount,
      currency: input.currency ?? 'HUF',
      donation_date: input.donation_date,
      payment_method: input.payment_method ?? null,
      reference: input.reference ?? null,
      notes: input.notes ?? null,
      source: input.source ?? null,
    });

  return db
    .prepare('SELECT * FROM donations WHERE id = ?')
    .get(result.lastInsertRowid) as Donation;
}

export function findById(id: number): DonationWithSupporter | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `SELECT d.*, s.name AS supporter_name
       FROM donations d
       JOIN supporters s ON d.supporter_id = s.id
       WHERE d.id = ?`,
    )
    .get(id) as DonationWithSupporter | undefined;
  return row ?? null;
}

export function findBySupporterId(supporterId: number): Donation[] {
  const db = getDatabase();
  return db
    .prepare('SELECT * FROM donations WHERE supporter_id = ? ORDER BY donation_date DESC')
    .all(supporterId) as Donation[];
}

export function findByDateRange(from: string, to: string): DonationWithSupporter[] {
  const db = getDatabase();
  return db
    .prepare(
      `SELECT d.*, s.name AS supporter_name
       FROM donations d
       JOIN supporters s ON d.supporter_id = s.id
       WHERE d.donation_date BETWEEN ? AND ?
       ORDER BY d.donation_date DESC`,
    )
    .all(from, to) as DonationWithSupporter[];
}

export function findAll(): DonationWithSupporter[] {
  const db = getDatabase();
  return db
    .prepare(
      `SELECT d.*, s.name AS supporter_name
       FROM donations d
       JOIN supporters s ON d.supporter_id = s.id
       ORDER BY d.donation_date DESC`,
    )
    .all() as DonationWithSupporter[];
}

export function update(input: UpdateDonationInput): Donation {
  const db = getDatabase();

  const fields: string[] = [];
  const params: Record<string, unknown> = { id: input.id };

  if (input.supporter_id !== undefined) {
    fields.push('supporter_id = @supporter_id');
    params.supporter_id = input.supporter_id;
  }
  if (input.amount !== undefined) {
    fields.push('amount = @amount');
    params.amount = input.amount;
  }
  if (input.currency !== undefined) {
    fields.push('currency = @currency');
    params.currency = input.currency;
  }
  if (input.donation_date !== undefined) {
    fields.push('donation_date = @donation_date');
    params.donation_date = input.donation_date;
  }
  if (input.payment_method !== undefined) {
    fields.push('payment_method = @payment_method');
    params.payment_method = input.payment_method;
  }
  if (input.reference !== undefined) {
    fields.push('reference = @reference');
    params.reference = input.reference;
  }
  if (input.notes !== undefined) {
    fields.push('notes = @notes');
    params.notes = input.notes;
  }
  if (input.source !== undefined) {
    fields.push('source = @source');
    params.source = input.source;
  }

  if (fields.length === 0) {
    return db.prepare('SELECT * FROM donations WHERE id = ?').get(input.id) as Donation;
  }

  fields.push("updated_at = datetime('now')");

  db.prepare(`UPDATE donations SET ${fields.join(', ')} WHERE id = @id`).run(params);

  return db.prepare('SELECT * FROM donations WHERE id = ?').get(input.id) as Donation;
}

export function remove(id: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM donations WHERE id = ?').run(id);
}

export function findExistingReferences(references: string[]): string[] {
  if (references.length === 0) return [];

  const db = getDatabase();
  const placeholders = references.map(() => '?').join(',');
  const rows = db
    .prepare(`SELECT reference FROM donations WHERE reference IN (${placeholders})`)
    .all(...references) as { reference: string }[];

  return rows.map((r) => r.reference);
}
