"use client";

import { useState, useEffect, useCallback } from 'react';
import { getUser, updateUser } from '@/lib/api/users';
import type { User } from '@/lib/types/user';
import type { ApiError } from '@/lib/types/api';
import type { UserFormData } from '@/lib/types/user';

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  update: (data: Partial<UserFormData>) => Promise<User>;
  refetch: () => Promise<void>;
}

export function useUser(id: number | string): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUser(id);
      setUser(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memuat pengguna');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const update = useCallback(async (data: Partial<UserFormData>): Promise<User> => {
    try {
      const updated = await updateUser(id, data);
      setUser(updated);
      return updated;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memperbarui pengguna');
      throw err;
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    update,
    refetch: fetchUser,
  };
}

