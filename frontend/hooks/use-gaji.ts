"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getGaji,
  generateGajiFromRekap,
  deleteGaji,
  updateGajiStatus,
  type GetGajiParams,
} from '@/lib/api/gaji';
import type { Gaji, StatusGaji } from '@/lib/types/gaji';
import type { ApiError } from '@/lib/types/api';

interface UseGajiReturn {
  gaji: Gaji[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  generateFromRekap: (rekapId: number | string) => Promise<Gaji>;
  updateStatus: (id: number | string, status: StatusGaji) => Promise<void>;
  removeGaji: (id: number | string) => Promise<void>;
}

export function useGaji(params?: GetGajiParams): UseGajiReturn {
  const [gaji, setGaji] = useState<Gaji[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGaji = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGaji(params);
      setGaji(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memuat gaji');
      setGaji([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const generateFromRekap = useCallback(async (rekapId: number | string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await generateGajiFromRekap(rekapId);
      await fetchGaji();
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal generate gaji dari rekap');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchGaji]);

  const updateStatus = useCallback(async (id: number | string, status: StatusGaji) => {
    try {
      await updateGajiStatus(id, status);
      await fetchGaji();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal update status gaji');
      throw err;
    }
  }, [fetchGaji]);

  const removeGaji = useCallback(async (id: number | string) => {
    try {
      await deleteGaji(id);
      setGaji((prev) => prev.filter((item) => item.id.toString() !== id.toString()));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menghapus gaji');
      await fetchGaji();
      throw err;
    }
  }, [fetchGaji]);

  useEffect(() => {
    fetchGaji();
  }, [fetchGaji]);

  return {
    gaji,
    loading,
    error,
    refetch: fetchGaji,
    generateFromRekap,
    updateStatus,
    removeGaji,
  };
}

