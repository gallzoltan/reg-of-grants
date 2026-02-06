import type {
  Supporter,
  SupporterEmail,
  SupporterPhone,
  SupporterWithContacts,
  CreateSupporterInput,
  UpdateSupporterInput,
} from './supporter';
import type {
  Donation,
  DonationWithSupporter,
  CreateDonationInput,
  UpdateDonationInput,
} from './donation';

export interface IpcChannelMap {
  'supporters:create': { input: CreateSupporterInput; output: SupporterWithContacts };
  'supporters:get': { input: number; output: SupporterWithContacts | null };
  'supporters:list': { input: void; output: SupporterWithContacts[] };
  'supporters:update': { input: UpdateSupporterInput; output: Supporter };
  'supporters:delete': { input: number; output: void };
  'supporters:addEmail': {
    input: { supporter_id: number; email: string; is_primary?: boolean };
    output: SupporterEmail;
  };
  'supporters:removeEmail': { input: number; output: void };
  'supporters:addPhone': {
    input: { supporter_id: number; phone: string; is_primary?: boolean };
    output: SupporterPhone;
  };
  'supporters:removePhone': { input: number; output: void };

  'donations:create': { input: CreateDonationInput; output: Donation };
  'donations:get': { input: number; output: DonationWithSupporter | null };
  'donations:list': { input: void; output: DonationWithSupporter[] };
  'donations:update': { input: UpdateDonationInput; output: Donation };
  'donations:delete': { input: number; output: void };
  'donations:bySupporter': { input: number; output: Donation[] };
  'donations:byDateRange': {
    input: { from: string; to: string };
    output: DonationWithSupporter[];
  };
}

export type IpcChannel = keyof IpcChannelMap;
