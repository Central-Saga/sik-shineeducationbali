"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getPermissions } from '@/lib/api/permissions';
import type { Permission } from '@/lib/types/permission';
import type { ApiError } from '@/lib/types/api';

interface GroupedPermissions {
  [resource: string]: Permission[];
}

interface UsePermissionsReturn {
  permissions: Permission[];
  groupedPermissions: GroupedPermissions;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getPermissionsByResource: (resource: string) => Permission[];
}

/**
 * Group permissions by resource (e.g., "users.view" -> "users")
 */
function groupPermissionsByResource(permissions: Permission[]): GroupedPermissions {
  return permissions.reduce((acc, permission) => {
    const [resource] = permission.name.split('.');
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as GroupedPermissions);
}

export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const groupedPermissions = useMemo(() => {
    return groupPermissionsByResource(permissions);
  }, [permissions]);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPermissions();
      // Sort permissions by name
      const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
      setPermissions(sorted);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch permissions');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPermissionsByResource = useCallback(
    (resource: string): Permission[] => {
      return groupedPermissions[resource] || [];
    },
    [groupedPermissions]
  );

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    groupedPermissions,
    loading,
    error,
    refetch: fetchPermissions,
    getPermissionsByResource,
  };
}

