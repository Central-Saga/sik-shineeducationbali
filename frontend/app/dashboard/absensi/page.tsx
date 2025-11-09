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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AbsensiTable } from "@/components/absensi/absensi-table";
import { AbsensiDetailDialog } from "@/components/absensi/absensi-detail-dialog";
import { useAbsensi } from "@/hooks/use-absensi";
import { toast } from "sonner";
import type { Absensi } from "@/lib/types/absensi";
import { Clock, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { HasCan } from "@/components/has-can";
import { getMyEmployee } from "@/lib/api/employees";

export default function AbsensiPage() {
  const { user, hasRole } = useAuth();
  const [statusFilter, setStatusFilter] = React.useState<string>("semua");
  const [dateFilter, setDateFilter] = React.useState<string>("semua");
  const [selectedAbsensi, setSelectedAbsensi] = React.useState<Absensi | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingAbsensi, setDeletingAbsensi] = React.useState<Absensi | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [employeeId, setEmployeeId] = React.useState<number | null>(null);

  // Get employee ID for karyawan - memoize to prevent unnecessary calls
  React.useEffect(() => {
    if (hasRole('Karyawan') && user?.id && !employeeId) {
      const loadEmployee = async () => {
        try {
          const employee = await getMyEmployee();
          if (employee) {
            setEmployeeId(employee.id);
          }
        } catch (error) {
          console.error("Failed to load employee:", error);
        }
      };
      loadEmployee();
    }
  }, [hasRole, user?.id, employeeId]);

  // Build params based on filters
  const params = React.useMemo(() => {
    const filters: Record<string, string | number> = {};
    
    // For karyawan, filter by their employee_id
    if (hasRole('Karyawan') && employeeId) {
      filters.karyawan_id = employeeId;
    }
    
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
  }, [statusFilter, dateFilter, hasRole, employeeId]);

  const { absensi, loading, error, refetch, removeAbsensi } = useAbsensi(params);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = absensi.length;
    const totalHadir = absensi.filter(
      (item) => item.status_kehadiran === "hadir"
    ).length;
    const totalIzin = absensi.filter(
      (item) => item.status_kehadiran === "izin"
    ).length;

    return { total, totalHadir, totalIzin };
  }, [absensi]);

  const handleViewDetail = (absensi: Absensi) => {
    setSelectedAbsensi(absensi);
    setDetailDialogOpen(true);
  };

  const handleDeleteClick = (absensi: Absensi) => {
    setDeletingAbsensi(absensi);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAbsensi) return;

    try {
      setIsDeleting(true);
      await removeAbsensi(deletingAbsensi.id);
      toast.success("Absensi berhasil dihapus");
      setDeleteDialogOpen(false);
      setDeletingAbsensi(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus absensi";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
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
              <HasCan role={["Admin", "Owner"]}>
                <Button asChild>
                  <a href="/dashboard/absensi/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Absensi
                  </a>
                </Button>
              </HasCan>
              <HasCan role="Karyawan">
                <Button asChild>
                  <a href="/dashboard/absensi/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Check In / Check Out
                  </a>
                </Button>
              </HasCan>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="hadir">Hadir</SelectItem>
                  <SelectItem value="izin">Izin</SelectItem>
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
          <div className="grid gap-4 md:grid-cols-3">
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
          </div>

          {/* Absensi Table */}
          <AbsensiTable
            absensi={absensi}
            loading={loading}
            onViewDetail={handleViewDetail}
            onDelete={handleDeleteClick}
          />
        </div>
      </SidebarInset>

      {/* Detail Dialog */}
      <AbsensiDetailDialog
        absensi={selectedAbsensi}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Absensi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus absensi untuk &quot;
              {deletingAbsensi?.employee?.user?.name || deletingAbsensi?.employee?.kode_karyawan || `ID: ${deletingAbsensi?.id}`}
              &quot; pada tanggal {deletingAbsensi?.tanggal ? new Date(deletingAbsensi.tanggal).toLocaleDateString('id-ID') : ''}? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingAbsensi(null);
              }}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}






