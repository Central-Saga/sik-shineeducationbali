import { apiClient } from './client';
import type { Employee, EmployeeFormData } from '@/lib/types/employee';

/**
 * Get all employees with user relation
 */
export async function getEmployees(): Promise<Employee[]> {
  const response = await apiClient.get<Employee[]>('/v1/employees', {
    params: {
      _t: Date.now(), // Cache busting
    },
  });
  return response.data;
}

/**
 * Get a single employee by ID with user relation
 */
export async function getEmployee(id: number | string): Promise<Employee> {
  const response = await apiClient.get<Employee>(`/v1/employees/${id}`);
  return response.data;
}

/**
 * Create a new employee
 */
export async function createEmployee(data: EmployeeFormData): Promise<Employee> {
  const response = await apiClient.post<Employee>('/v1/employees', data);
  return response.data;
}

/**
 * Update an existing employee
 */
export async function updateEmployee(id: number | string, data: Partial<EmployeeFormData>): Promise<Employee> {
  const response = await apiClient.put<Employee>(`/v1/employees/${id}`, data);
  return response.data;
}

/**
 * Delete an employee
 */
export async function deleteEmployee(id: number | string): Promise<void> {
  await apiClient.delete(`/v1/employees/${id}`);
}

