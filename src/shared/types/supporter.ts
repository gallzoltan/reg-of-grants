export interface Supporter {
  id: number;
  name: string;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupporterEmail {
  id: number;
  supporter_id: number;
  email: string;
  is_primary: 0 | 1;
  created_at: string;
}

export interface SupporterPhone {
  id: number;
  supporter_id: number;
  phone: string;
  is_primary: 0 | 1;
  created_at: string;
}

export interface SupporterWithContacts extends Supporter {
  emails: SupporterEmail[];
  phones: SupporterPhone[];
}

export interface CreateSupporterInput {
  name: string;
  address?: string;
  notes?: string;
  emails?: Array<{ email: string; is_primary?: boolean }>;
  phones?: Array<{ phone: string; is_primary?: boolean }>;
}

export interface UpdateSupporterInput {
  id: number;
  name?: string;
  address?: string;
  notes?: string;
}
