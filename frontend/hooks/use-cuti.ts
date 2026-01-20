"use client";

import { useState, useEffect, useCallback } from 'react';
import { getCuti, deleteCuti, cancelCuti, requestCancellation, approveCancellation, rejectCancellation, type GetCutiParams } from '@/lib/api/cuti';
import type { Cuti } from '@/lib/types/cuti';
import type { ApiError } from '@/lib/types/api';

interface UseCutiReturn {
  cuti: Cuti[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeCuti: (id: number | string) => Promise<void>;
  cancelCuti: (id: number | string) => Promise<void>;
  requestCancellation: (id: number | string) => Promise<void>;
  approveCancellation: (id: number | string) => Promise<void>;
  rejectCancellation: (id: number | string) => Promise<void>;
}

export function useCuti(params?: GetCutiParams): UseCutiReturn {
  const [cuti, setCuti] = useState<Cuti[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCuti = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCuti(params);
      setCuti(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memuat cuti');
      setCuti([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const removeCuti = useCallback(async (id: number | string) => {
    try {
      await deleteCuti(id);
      // Optimistically remove from state
      setCuti((prev) => prev.filter((item) => item.id.toString() !== id.toString()));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menghapus cuti');
      // Refetch on error to sync state
      await fetchCuti();
      throw err;
    }
  }, [fetchCuti]);

  const handleCancelCuti = useCallback(async (id: number | string) => {
    try {
      const updatedCuti = await cancelCuti(id);
      // Update the cuti in state
      setCuti((prev) => prev.map((item) => 
        item.id.toString() === id.toString() ? updatedCuti : item
      ));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal membatalkan cuti');
      await fetchCuti();
      throw err;
    }
  }, [fetchCuti]);

  const handleRequestCancellation = useCallback(async (id: number | string) => {
    try {
      const updatedCuti = await requestCancellation(id);
      // Update the cuti in state
      setCuti((prev) => prev.map((item) => 
        item.id.toString() === id.toString() ? updatedCuti : item
      ));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal mengajukan pembatalan');
      await fetchCuti();
      throw err;
    }
  }, [fetchCuti]);

  const handleApproveCancellation = useCallback(async (id: number | string) => {
    try {
      const updatedCuti = await approveCancellation(id);
      // Update the cuti in state
      setCuti((prev) => prev.map((item) => 
        item.id.toString() === id.toString() ? updatedCuti : item
      ));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menyetujui pembatalan');
      await fetchCuti();
      throw err;
    }
  }, [fetchCuti]);

  const handleRejectCancellation = useCallback(async (id: number | string) => {
    try {
      const updatedCuti = await rejectCancellation(id);
      // Update the cuti in state
      setCuti((prev) => prev.map((item) => 
        item.id.toString() === id.toString() ? updatedCuti : item
      ));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menolak pembatalan');
      await fetchCuti();
      throw err;
    }
  }, [fetchCuti]);

  useEffect(() => {
    fetchCuti();
  }, [fetchCuti]);

  return {
    cuti,
    loading,
    error,
    refetch: fetchCuti,
    removeCuti,
    cancelCuti: handleCancelCuti,
    requestCancellation: handleRequestCancellation,
    approveCancellation: handleApproveCancellation,
    rejectCancellation: handleRejectCancellation,
  };
}

