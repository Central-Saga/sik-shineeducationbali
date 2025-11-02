"use client";

import { useState, useEffect, useCallback } from 'react';
import { getRole, updateRole } from '@/lib/api/roles';
import type { Role, RoleFormData } from '@/lib/types/role';
import type { ApiError } from '@/lib/types/api';

interface UseRoleReturn {
  role: Role | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  update: (data: Partial<RoleFormData>) => Promise<Role>;
}

export function useRole(id: number | string | null): UseRoleReturn {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getRole(id);
      setRole(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch role');
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const update = useCallback(async (data: Partial<RoleFormData>): Promise<Role> => {
    if (!id) {
      throw new Error('Role ID is required');
    }

    try {
      setError(null);
      const updatedRole = await updateRole(id, data);
      setRole(updatedRole);
      return updatedRole;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update role');
      throw err;
    }
  }, [id]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return {
    role,
    loading,
    error,
    refetch: fetchRole,
    update,
  };
}

