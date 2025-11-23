"use client";

import { useState, useEffect, useCallback } from 'react';
import { getCuti, deleteCuti, type GetCutiParams } from '@/lib/api/cuti';
import type { Cuti } from '@/lib/types/cuti';
import type { ApiError } from '@/lib/types/api';

interface UseCutiReturn {
  cuti: Cuti[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeCuti: (id: number | string) => Promise<void>;
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

  useEffect(() => {
    fetchCuti();
  }, [fetchCuti]);

  return {
    cuti,
    loading,
    error,
    refetch: fetchCuti,
    removeCuti,
  };
}

