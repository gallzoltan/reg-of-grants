import { getDatabase } from './connection';
import type {
  Supporter,
  SupporterEmail,
  SupporterPhone,
  SupporterWithContacts,
  CreateSupporterInput,
  UpdateSupporterInput,
} from '@shared/types/supporter';

function attachContacts(supporter: Supporter): SupporterWithContacts {
  const db = getDatabase();
  const emails = db
    .prepare('SELECT * FROM supporter_emails WHERE supporter_id = ? ORDER BY is_primary DESC, id')
    .all(supporter.id) as SupporterEmail[];
  const phones = db
    .prepare('SELECT * FROM supporter_phones WHERE supporter_id = ? ORDER BY is_primary DESC, id')
    .all(supporter.id) as SupporterPhone[];
  return { ...supporter, emails, phones };
}

export function create(input: CreateSupporterInput): SupporterWithContacts {
  const db = getDatabase();

  const insertSupporter = db.prepare(`
    INSERT INTO supporters (name, address, notes)
    VALUES (@name, @address, @notes)
  `);

  const insertEmail = db.prepare(`
    INSERT INTO supporter_emails (supporter_id, email, is_primary)
    VALUES (@supporter_id, @email, @is_primary)
  `);

  const insertPhone = db.prepare(`
    INSERT INTO supporter_phones (supporter_id, phone, is_primary)
    VALUES (@supporter_id, @phone, @is_primary)
  `);

  const transaction = db.transaction(() => {
    const result = insertSupporter.run({
      name: input.name,
      address: input.address ?? null,
      notes: input.notes ?? null,
    });
    const supporterId = result.lastInsertRowid as number;

    if (input.emails) {
      for (const e of input.emails) {
        insertEmail.run({
          supporter_id: supporterId,
          email: e.email,
          is_primary: e.is_primary ? 1 : 0,
        });
      }
    }

    if (input.phones) {
      for (const p of input.phones) {
        insertPhone.run({
          supporter_id: supporterId,
          phone: p.phone,
          is_primary: p.is_primary ? 1 : 0,
        });
      }
    }

    return supporterId;
  });

  const supporterId = transaction();
  const supporter = findById(supporterId);
  if (!supporter) {
    throw new Error(`Supporter with id ${supporterId} not found after creation.`);
  }
  return supporter;
}

export function findById(id: number): SupporterWithContacts | null {
  const db = getDatabase();
  const supporter = db
    .prepare('SELECT * FROM supporters WHERE id = ?')
    .get(id) as Supporter | undefined;
  if (!supporter) return null;
  return attachContacts(supporter);
}

export function findAll(): SupporterWithContacts[] {
  const db = getDatabase();
  const supporters = db
    .prepare('SELECT * FROM supporters ORDER BY name')
    .all() as Supporter[];
  return supporters.map(attachContacts);
}

export function update(input: UpdateSupporterInput): Supporter {
  const db = getDatabase();

  const fields: string[] = [];
  const params: Record<string, unknown> = { id: input.id };

  if (input.name !== undefined) {
    fields.push('name = @name');
    params.name = input.name;
  }
  if (input.address !== undefined) {
    fields.push('address = @address');
    params.address = input.address;
  }
  if (input.notes !== undefined) {
    fields.push('notes = @notes');
    params.notes = input.notes;
  }

  if (fields.length === 0) {
    const supporter = findById(input.id);
    if (!supporter) {
      throw new Error(`Supporter with id ${input.id} not found.`);
    }
    return supporter as Supporter;
  }

  fields.push("updated_at = datetime('now')");

  db.prepare(`UPDATE supporters SET ${fields.join(', ')} WHERE id = @id`).run(params);

  return db.prepare('SELECT * FROM supporters WHERE id = ?').get(input.id) as Supporter;
}

export function remove(id: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM supporters WHERE id = ?').run(id);
}

export function addEmail(
  supporter_id: number,
  email: string,
  is_primary = false,
): SupporterEmail {
  const db = getDatabase();
  const result = db
    .prepare(
      'INSERT INTO supporter_emails (supporter_id, email, is_primary) VALUES (?, ?, ?)',
    )
    .run(supporter_id, email, is_primary ? 1 : 0);
  return db
    .prepare('SELECT * FROM supporter_emails WHERE id = ?')
    .get(result.lastInsertRowid) as SupporterEmail;
}

export function removeEmail(id: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM supporter_emails WHERE id = ?').run(id);
}

export function addPhone(
  supporter_id: number,
  phone: string,
  is_primary = false,
): SupporterPhone {
  const db = getDatabase();
  const result = db
    .prepare(
      'INSERT INTO supporter_phones (supporter_id, phone, is_primary) VALUES (?, ?, ?)',
    )
    .run(supporter_id, phone, is_primary ? 1 : 0);
  return db
    .prepare('SELECT * FROM supporter_phones WHERE id = ?')
    .get(result.lastInsertRowid) as SupporterPhone;
}

export function removePhone(id: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM supporter_phones WHERE id = ?').run(id);
}
