'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ApiResponse, PaymentHistory, PaymentHistoryInput } from '@/types';

export function usePaymentHistories(enabled = true) {
  const [data, setData] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentHistories = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get<ApiResponse<PaymentHistory[]>>('/payment-history');
      setData(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      void Promise.resolve().then(fetchPaymentHistories);
    }
  }, [enabled, fetchPaymentHistories]);

  return { data, isLoading, error, refetch: fetchPaymentHistories };
}

export async function createPaymentHistory(input: PaymentHistoryInput): Promise<PaymentHistory> {
  const res = await api.post<ApiResponse<PaymentHistory>>('/payment-history', input);
  return res.data;
}

export async function updatePaymentHistory(
  paymentHistoryId: string,
  input: Partial<PaymentHistoryInput>,
): Promise<PaymentHistory> {
  const res = await api.patch<ApiResponse<PaymentHistory>>(`/payment-history/${paymentHistoryId}`, input);
  return res.data;
}

export async function deletePaymentHistory(paymentHistoryId: string): Promise<void> {
  await api.delete<ApiResponse<{ id: string }>>(`/payment-history/${paymentHistoryId}`);
}