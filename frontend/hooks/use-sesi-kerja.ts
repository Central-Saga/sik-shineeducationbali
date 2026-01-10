"use client";

import { useState, useEffect, useCallback } from 'react';
import { getSesiKerja, deleteSesiKerja, type GetSesiKerjaParams } from '@/lib/api/sesi-kerja';
import type { SesiKerja } from '@/lib/types/sesi-kerja';
import type { ApiError } from '@/lib/types/api';

interface UseSesiKerjaReturn {
  sesiKerja: SesiKerja[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeSesiKerja: (id: number | string) => Promise<void>;
}

export function useSesiKerja(params?: GetSesiKerjaParams): UseSesiKerjaReturn {
  const [sesiKerja, setSesiKerja] = useState<SesiKerja[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSesiKerja = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSesiKerja(params);
      setSesiKerja(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memuat sesi kerja');
      setSesiKerja([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const removeSesiKerja = useCallback(async (id: number | string) => {
    try {
      await deleteSesiKerja(id);
      // Optimistically remove from state
      setSesiKerja((prev) => prev.filter((item) => item.id.toString() !== id.toString()));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menghapus sesi kerja');
      // Refetch on error to sync state
      await fetchSesiKerja();
      throw err;
    }
  }, [fetchSesiKerja]);

  useEffect(() => {
    fetchSesiKerja();
  }, [fetchSesiKerja]);

  return {
    sesiKerja,
    loading,
    error,
    refetch: fetchSesiKerja,
    removeSesiKerja,
  };
}

