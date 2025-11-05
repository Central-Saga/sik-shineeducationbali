"use client";

import * as React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AbsensiTable } from "@/components/absensi/absensi-table";
import { useAbsensi } from "@/hooks/use-absensi";
import { Clock } from "lucide-react";

export default function AbsensiPage() {
  const [statusFilter, setStatusFilter] = React.useState<string>("semua");
  const [dateFilter, setDateFilter] = React.useState<string>("semua");

  // Build params based on filters
  const params = React.useMemo(() => {
    const filters: any = {};
    
    if (statusFilter !== "semua") {
      filters.status_kehadiran = statusFilter;
    }

    if (dateFilter === "hari-ini") {
      const today = new Date().toISOString().split('T')[0];
      filters.tanggal = today;
    } else if (dateFilter === "minggu-ini") {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      filters.start_date = startOfWeek.toISOString().split('T')[0];
      filters.end_date = today.toISOString().split('T')[0];
    } else if (dateFilter === "bulan-ini") {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      filters.start_date = startOfMonth.toISOString().split('T')[0];
      filters.end_date = today.toISOString().split('T')[0];
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [statusFilter, dateFilter]);

  const { absensi, loading, error } = useAbsensi(params);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = absensi.length;
    const totalHadir = absensi.filter(
      (item) => item.status_kehadiran === "hadir"
    ).length;
    const totalIzin = absensi.filter(
      (item) => item.status_kehadiran === "izin"
    ).length;
    const totalSakit = absensi.filter(
      (item) => item.status_kehadiran === "sakit"
    ).length;
    const totalAlpa = absensi.filter(
      (item) => item.status_kehadiran === "alpa"
    ).length;

    return { total, totalHadir, totalIzin, totalSakit, totalAlpa };
  }, [absensi]);

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
                <BreadcrumbPage>Absensi</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Daftar Absensi
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="hadir">Hadir</SelectItem>
                  <SelectItem value="izin">Izin</SelectItem>
                  <SelectItem value="sakit">Sakit</SelectItem>
                  <SelectItem value="alpa">Alpa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Tanggal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Tanggal</SelectItem>
                  <SelectItem value="hari-ini">Hari Ini</SelectItem>
                  <SelectItem value="minggu-ini">Minggu Ini</SelectItem>
                  <SelectItem value="bulan-ini">Bulan Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Absensi
              </div>
              <div className="text-2xl font-bold mt-1">
                {loading ? "..." : stats.total}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Hadir
              </div>
              <div className="text-2xl font-bold mt-1 text-green-600">
                {loading ? "..." : stats.totalHadir}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Izin
              </div>
              <div className="text-2xl font-bold mt-1 text-blue-600">
                {loading ? "..." : stats.totalIzin}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Sakit
              </div>
              <div className="text-2xl font-bold mt-1 text-yellow-600">
                {loading ? "..." : stats.totalSakit}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Alpa
              </div>
              <div className="text-2xl font-bold mt-1 text-red-600">
                {loading ? "..." : stats.totalAlpa}
              </div>
            </div>
          </div>

          {/* Absensi Table */}
          <AbsensiTable absensi={absensi} loading={loading} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}



