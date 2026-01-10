"use client";

import { useState, useEffect, useCallback } from 'react';
import { getUsers, deleteUser } from '@/lib/api/users';
import type { User } from '@/lib/types/user';
import type { ApiError } from '@/lib/types/api';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeUser: (id: number | string) => Promise<void>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memuat pengguna');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeUser = useCallback(async (id: number | string) => {
    try {
      await deleteUser(id);
      // Optimistically remove from state
      setUsers((prev) => prev.filter((user) => user.id.toString() !== id.toString()));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menghapus pengguna');
      // Refetch on error to sync state
      await fetchUsers();
      throw err;
    }
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    removeUser,
  };
}

