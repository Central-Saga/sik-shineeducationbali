"use client";

import { useState, useEffect, useCallback } from 'react';
import { getEmployees, deleteEmployee } from '@/lib/api/employees';
import type { Employee } from '@/lib/types/employee';
import type { ApiError } from '@/lib/types/api';

interface UseEmployeesReturn {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeEmployee: (id: number | string) => Promise<void>;
}

export function useEmployees(): UseEmployeesReturn {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memuat karyawan');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeEmployee = useCallback(async (id: number | string) => {
    try {
      await deleteEmployee(id);
      // Optimistically remove from state
      setEmployees((prev) => prev.filter((employee) => employee.id.toString() !== id.toString()));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal menghapus karyawan');
      // Refetch on error to sync state
      await fetchEmployees();
      throw err;
    }
  }, [fetchEmployees]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
    removeEmployee,
  };
}

