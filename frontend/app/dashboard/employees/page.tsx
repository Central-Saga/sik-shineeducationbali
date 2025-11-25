"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeTable } from "@/components/employees/employee-table";
import { useEmployees } from "@/hooks/use-employees";
import { updateEmployeeStatus } from "@/lib/api/employees";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Employee } from "@/lib/types/employee";

export default function EmployeesPage() {
  const router = useRouter();
  const { employees, loading, error, refetch } = useEmployees();
  const [statusFilter, setStatusFilter] = React.useState<string>("semua");
  const [kategoriFilter, setKategoriFilter] = React.useState<string>("semua");

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = employees.length;
    const totalTetap = employees.filter(
      (employee) => employee.kategori_karyawan === "tetap"
    ).length;
    const totalKontrak = employees.filter(
      (employee) => employee.kategori_karyawan === "kontrak"
    ).length;

    return { total, totalTetap, totalKontrak };
  }, [employees]);

  // Filter employees based on status and kategori
  const filteredEmployees = React.useMemo(() => {
    let filtered = employees;

    // Filter by status
    if (statusFilter !== "semua") {
      filtered = filtered.filter((employee) => employee.status === statusFilter);
    }

    // Filter by kategori
    if (kategoriFilter !== "semua") {
      filtered = filtered.filter(
        (employee) => employee.kategori_karyawan === kategoriFilter
      );
    }

    return filtered;
  }, [employees, statusFilter, kategoriFilter]);

  const handleView = (employee: Employee) => {
    router.push(`/dashboard/employees/${employee.id}`);
  };

  const handleEdit = (employee: Employee) => {
    router.push(`/dashboard/employees/${employee.id}/edit`);
  };

  const handleUpdateStatus = async (employee: Employee, newStatus: 'aktif' | 'nonaktif') => {
    try {
      await updateEmployeeStatus(employee.id, newStatus);
      toast.success(`Status karyawan berhasil diubah menjadi ${newStatus === 'aktif' ? 'Aktif' : 'Nonaktif'}`);
      await refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal mengubah status karyawan";
      toast.error(errorMessage);
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Karyawan</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Daftar Karyawan
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
              <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kategori</SelectItem>
                  <SelectItem value="tetap">Tetap</SelectItem>
                  <SelectItem value="kontrak">Kontrak</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
              <Button asChild>
                <Link href="/dashboard/employees/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Karyawan
                </Link>
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Karyawan
              </div>
              <div className="text-2xl font-bold mt-1">
                {loading ? "..." : stats.total}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Karyawan Tetap
              </div>
              <div className="text-2xl font-bold mt-1">
                {loading ? "..." : stats.totalTetap}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Karyawan Kontrak
              </div>
              <div className="text-2xl font-bold mt-1">
                {loading ? "..." : stats.totalKontrak}
              </div>
            </div>
          </div>

          {/* Employees Table */}
          <EmployeeTable
            employees={filteredEmployees}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

