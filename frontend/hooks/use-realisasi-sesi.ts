"use client";

import { useState, useEffect, useCallback } from 'react';
import { getRealisasiSesi, deleteRealisasiSesi, approveRealisasiSesi, rejectRealisasiSesi, type GetRealisasiSesiParams } from '@/lib/api/realisasi-sesi';
import type { RealisasiSesi } from '@/lib/types/realisasi-sesi';
import type { ApiError } from '@/lib/types/api';

interface UseRealisasiSesiReturn {
  realisasiSesi: RealisasiSesi[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeRealisasiSesi: (id: number | string) => Promise<void>;
  approveRealisasiSesi: (id: number | string, catatan?: string) => Promise<void>;
  rejectRealisasiSesi: (id: number | string, catatan: string) => Promise<void>;
}

export function useRealisasiSesi(params?: GetRealisasiSesiParams): UseRealisasiSesiReturn {
  const [realisasiSesi, setRealisasiSesi] = useState<RealisasiSesi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRealisasiSesi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRealisasiSesi(params);
      setRealisasiSesi(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memuat realisasi sesi');
      setRealisasiSesi([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const removeRealisasiSesi = useCallback(async (id: number | string) => {
    try {
      await deleteRealisasiSesi(id);
      // Optimistically remove from state
      setRealisasiSesi((prev) => prev.filter((item) => item.id.toString() !== id.toString()));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menghapus realisasi sesi');
      // Refetch on error to sync state
      await fetchRealisasiSesi();
      throw err;
    }
  }, [fetchRealisasiSesi]);

  const handleApprove = useCallback(async (id: number | string, catatan?: string) => {
    try {
      await approveRealisasiSesi(id, catatan);
      // Refetch to get updated data
      await fetchRealisasiSesi();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menyetujui realisasi sesi');
      throw err;
    }
  }, [fetchRealisasiSesi]);

  const handleReject = useCallback(async (id: number | string, catatan: string) => {
    try {
      await rejectRealisasiSesi(id, catatan);
      // Refetch to get updated data
      await fetchRealisasiSesi();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menolak realisasi sesi');
      throw err;
    }
  }, [fetchRealisasiSesi]);

  useEffect(() => {
    fetchRealisasiSesi();
  }, [fetchRealisasiSesi]);

  return {
    realisasiSesi,
    loading,
    error,
    refetch: fetchRealisasiSesi,
    removeRealisasiSesi,
    approveRealisasiSesi: handleApprove,
    rejectRealisasiSesi: handleReject,
  };
}

