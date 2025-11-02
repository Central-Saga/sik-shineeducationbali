"use client";

import { useState, useEffect, useCallback } from 'react';
import { getRoles, deleteRole } from '@/lib/api/roles';
import type { Role } from '@/lib/types/role';
import type { ApiError } from '@/lib/types/api';

interface UseRolesReturn {
  roles: Role[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeRole: (id: number | string) => Promise<void>;
}

export function useRoles(): UseRolesReturn {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeRole = useCallback(async (id: number | string) => {
    try {
      await deleteRole(id);
      // Optimistically remove from state
      setRoles((prev) => prev.filter((role) => role.id.toString() !== id.toString()));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete role');
      // Refetch on error to sync state
      await fetchRoles();
      throw err;
    }
  }, [fetchRoles]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles,
    removeRole,
  };
}

