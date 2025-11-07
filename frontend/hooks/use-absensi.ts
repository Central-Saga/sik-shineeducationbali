"use client";

import { useState, useEffect, useCallback } from 'react';
import { getAbsensi, deleteAbsensi, type GetAbsensiParams } from '@/lib/api/absensi';
import type { Absensi } from '@/lib/types/absensi';
import type { ApiError } from '@/lib/types/api';

interface UseAbsensiReturn {
  absensi: Absensi[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeAbsensi: (id: number | string) => Promise<void>;
}

export function useAbsensi(params?: GetAbsensiParams): UseAbsensiReturn {
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAbsensi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAbsensi(params);
      setAbsensi(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memuat absensi');
      setAbsensi([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const removeAbsensi = useCallback(async (id: number | string) => {
    try {
      await deleteAbsensi(id);
      // Optimistically remove from state
      setAbsensi((prev) => prev.filter((item) => item.id.toString() !== id.toString()));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menghapus absensi');
      // Refetch on error to sync state
      await fetchAbsensi();
      throw err;
    }
  }, [fetchAbsensi]);

  useEffect(() => {
    fetchAbsensi();
  }, [fetchAbsensi]);

  return {
    absensi,
    loading,
    error,
    refetch: fetchAbsensi,
    removeAbsensi,
  };
}






