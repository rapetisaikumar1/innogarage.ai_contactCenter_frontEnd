export type PaymentHistoryStatus =
  | 'PAID_ON_TIME'
  | 'ASKED_FOR_EXTENSION'
  | 'FULLY_PAID'
  | 'NOT_RESPONDING'
  | 'ABSCONDED';

export interface PaymentHistory {
  id: string;
  name: string;
  placedCompany: string;
  placedJobTitle: string;
  status: PaymentHistoryStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistoryInput {
  name: string;
  placedCompany: string;
  placedJobTitle: string;
  status: PaymentHistoryStatus;
  notes?: string;
}

export const PAYMENT_HISTORY_STATUS_ORDER: PaymentHistoryStatus[] = [
  'PAID_ON_TIME',
  'ASKED_FOR_EXTENSION',
  'FULLY_PAID',
  'NOT_RESPONDING',
  'ABSCONDED',
];

export const PAYMENT_HISTORY_STATUS_LABELS: Record<PaymentHistoryStatus, string> = {
  PAID_ON_TIME: 'Paid on time',
  ASKED_FOR_EXTENSION: 'Asked for extension',
  FULLY_PAID: 'Fully paid',
  NOT_RESPONDING: 'Not responding',
  ABSCONDED: 'Absconded',
};