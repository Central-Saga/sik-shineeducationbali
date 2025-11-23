"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getPembayaranGaji,
  createPembayaranGaji,
  updatePembayaranGaji,
  updatePembayaranGajiStatus,
  deletePembayaranGaji,
} from '@/lib/api/gaji';
import type { PembayaranGaji, PembayaranGajiFormData, StatusPembayaran } from '@/lib/types/gaji';
import type { ApiError } from '@/lib/types/api';

interface UsePembayaranGajiReturn {
  pembayaranGaji: PembayaranGaji[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: PembayaranGajiFormData) => Promise<PembayaranGaji>;
  update: (id: number | string, data: Partial<PembayaranGajiFormData>) => Promise<PembayaranGaji>;
  updateStatus: (id: number | string, status: StatusPembayaran) => Promise<void>;
  remove: (id: number | string) => Promise<void>;
}

export function usePembayaranGaji(gajiId: number | string): UsePembayaranGajiReturn {
  const [pembayaranGaji, setPembayaranGaji] = useState<PembayaranGaji[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPembayaranGaji = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPembayaranGaji(gajiId);
      setPembayaranGaji(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memuat pembayaran gaji');
      setPembayaranGaji([]);
    } finally {
      setLoading(false);
    }
  }, [gajiId]);

  const create = useCallback(async (data: PembayaranGajiFormData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createPembayaranGaji(gajiId, data);
      await fetchPembayaranGaji();
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal membuat pembayaran gaji');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [gajiId, fetchPembayaranGaji]);

  const update = useCallback(async (id: number | string, data: Partial<PembayaranGajiFormData>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updatePembayaranGaji(id, data);
      await fetchPembayaranGaji();
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal update pembayaran gaji');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPembayaranGaji]);

  const updateStatus = useCallback(async (id: number | string, status: StatusPembayaran) => {
    try {
      setLoading(true);
      setError(null);
      await updatePembayaranGajiStatus(id, status);
      await fetchPembayaranGaji();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal update status pembayaran gaji');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPembayaranGaji]);

  const remove = useCallback(async (id: number | string) => {
    try {
      await deletePembayaranGaji(id);
      setPembayaranGaji((prev) => prev.filter((item) => item.id.toString() !== id.toString()));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menghapus pembayaran gaji');
      await fetchPembayaranGaji();
      throw err;
    }
  }, [fetchPembayaranGaji]);

  useEffect(() => {
    fetchPembayaranGaji();
  }, [fetchPembayaranGaji]);

  return {
    pembayaranGaji,
    loading,
    error,
    refetch: fetchPembayaranGaji,
    create,
    update,
    updateStatus,
    remove,
  };
}

