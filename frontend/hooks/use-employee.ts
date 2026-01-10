"use client";

import { useState, useEffect, useCallback } from 'react';
import { getEmployee, updateEmployee } from '@/lib/api/employees';
import type { Employee, EmployeeFormData } from '@/lib/types/employee';
import type { ApiError } from '@/lib/types/api';

interface UseEmployeeReturn {
  employee: Employee | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  update: (data: Partial<EmployeeFormData>) => Promise<Employee>;
}

export function useEmployee(id: number | string | null): UseEmployeeReturn {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployee = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getEmployee(id);
      setEmployee(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memuat karyawan');
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const update = useCallback(async (data: Partial<EmployeeFormData>): Promise<Employee> => {
    if (!id) {
      throw new Error('ID karyawan tidak tersedia');
    }

    try {
      setError(null);
      const updated = await updateEmployee(id, data);
      setEmployee(updated);
      return updated;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal memperbarui karyawan');
      throw err;
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  return {
    employee,
    loading,
    error,
    refetch: fetchEmployee,
    update,
  };
}

