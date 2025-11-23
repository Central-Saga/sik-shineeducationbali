"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getKomponenGaji,
  createKomponenGaji,
  updateKomponenGaji,
  deleteKomponenGaji,
} from '@/lib/api/gaji';
import type { KomponenGaji, KomponenGajiFormData } from '@/lib/types/gaji';
import type { ApiError } from '@/lib/types/api';

interface UseKomponenGajiReturn {
  komponenGaji: KomponenGaji[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: KomponenGajiFormData) => Promise<KomponenGaji>;
  update: (id: number | string, data: Partial<KomponenGajiFormData>) => Promise<KomponenGaji>;
  remove: (id: number | string) => Promise<void>;
}

export function useKomponenGaji(gajiId: number | string): UseKomponenGajiReturn {
  const [komponenGaji, setKomponenGaji] = useState<KomponenGaji[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKomponenGaji = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKomponenGaji(gajiId);
      setKomponenGaji(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memuat komponen gaji');
      setKomponenGaji([]);
    } finally {
      setLoading(false);
    }
  }, [gajiId]);

  const create = useCallback(async (data: KomponenGajiFormData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createKomponenGaji(gajiId, data);
      await fetchKomponenGaji();
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal membuat komponen gaji');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [gajiId, fetchKomponenGaji]);

  const update = useCallback(async (id: number | string, data: Partial<KomponenGajiFormData>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateKomponenGaji(id, data);
      await fetchKomponenGaji();
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal update komponen gaji');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchKomponenGaji]);

  const remove = useCallback(async (id: number | string) => {
    try {
      await deleteKomponenGaji(id);
      setKomponenGaji((prev) => prev.filter((item) => item.id.toString() !== id.toString()));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menghapus komponen gaji');
      await fetchKomponenGaji();
      throw err;
    }
  }, [fetchKomponenGaji]);

  useEffect(() => {
    fetchKomponenGaji();
  }, [fetchKomponenGaji]);

  return {
    komponenGaji,
    loading,
    error,
    refetch: fetchKomponenGaji,
    create,
    update,
    remove,
  };
}

