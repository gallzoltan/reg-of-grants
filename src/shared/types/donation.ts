export interface Donation {
  id: number;
  supporter_id: number;
  amount: number;
  currency: string;
  donation_date: string;
  payment_method: string | null;
  reference: string | null;
  notes: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonationWithSupporter extends Donation {
  supporter_name: string;
}

export interface CreateDonationInput {
  supporter_id: number;
  amount: number;
  currency?: string;
  donation_date: string;
  payment_method?: string;
  reference?: string;
  notes?: string;
  source?: string;
}

export interface UpdateDonationInput {
  id: number;
  supporter_id?: number;
  amount?: number;
  currency?: string;
  donation_date?: string;
  payment_method?: string;
  reference?: string;
  notes?: string;
  source?: string;
}
