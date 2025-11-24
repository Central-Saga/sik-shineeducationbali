"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getRekapBulanan,
  generateRekapBulanan,
  deleteRekapBulanan,
  type GetRekapBulananParams,
} from '@/lib/api/rekap-bulanan';
import type { RekapBulanan, RekapBulananFormData } from '@/lib/types/rekap-bulanan';
import type { ApiError } from '@/lib/types/api';

interface UseRekapBulananReturn {
  rekapBulanan: RekapBulanan[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  generate: (data: RekapBulananFormData) => Promise<RekapBulanan[]>;
  removeRekapBulanan: (id: number | string) => Promise<void>;
}

export function useRekapBulanan(params?: GetRekapBulananParams): UseRekapBulananReturn {
  const [rekapBulanan, setRekapBulanan] = useState<RekapBulanan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRekapBulanan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRekapBulanan(params);
      setRekapBulanan(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memuat rekap bulanan');
      setRekapBulanan([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const generate = useCallback(async (data: RekapBulananFormData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await generateRekapBulanan(data);
      await fetchRekapBulanan();
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal generate rekap bulanan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRekapBulanan]);

  const removeRekapBulanan = useCallback(async (id: number | string) => {
    try {
      await deleteRekapBulanan(id);
      setRekapBulanan((prev) => prev.filter((item) => item.id.toString() !== id.toString()));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menghapus rekap bulanan');
      await fetchRekapBulanan();
      throw err;
    }
  }, [fetchRekapBulanan]);

  useEffect(() => {
    fetchRekapBulanan();
  }, [fetchRekapBulanan]);

  return {
    rekapBulanan,
    loading,
    error,
    refetch: fetchRekapBulanan,
    generate,
    removeRekapBulanan,
  };
}

