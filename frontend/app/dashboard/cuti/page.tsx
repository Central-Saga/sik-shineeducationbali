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
import { CutiTable } from "@/components/cuti/cuti-table";
import { CutiDetailDialog } from "@/components/cuti/cuti-detail-dialog";
import { useCuti } from "@/hooks/use-cuti";
import { toast } from "sonner";
import type { Cuti } from "@/lib/types/cuti";
import { CalendarDays, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { HasCan } from "@/components/has-can";
import { getMyEmployee } from "@/lib/api/employees";
import { approveCuti, rejectCuti } from "@/lib/api/cuti";

export default function CutiPage() {
  const { user, hasRole } = useAuth();
  const [statusFilter, setStatusFilter] = React.useState<string>("semua");
  const [jenisFilter, setJenisFilter] = React.useState<string>("semua");
  const [dateFilter, setDateFilter] = React.useState<string>("semua");
  const [selectedCuti, setSelectedCuti] = React.useState<Cuti | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingCuti, setDeletingCuti] = React.useState<Cuti | null>(null);
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
      filters.karyawan_id = employeeId.toString();
    }
    
    if (statusFilter !== "semua") {
      filters.status = statusFilter;
    }

    if (jenisFilter !== "semua") {
      filters.jenis = jenisFilter;
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
  }, [statusFilter, jenisFilter, dateFilter, hasRole, employeeId]);

  const { cuti, loading, error, refetch, removeCuti } = useCuti(params);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = cuti.length;
    const totalDiajukan = cuti.filter(
      (item) => item.status === "diajukan"
    ).length;
    const totalDisetujui = cuti.filter(
      (item) => item.status === "disetujui"
    ).length;
    const totalDitolak = cuti.filter(
      (item) => item.status === "ditolak"
    ).length;

    return { total, totalDiajukan, totalDisetujui, totalDitolak };
  }, [cuti]);

  const handleViewDetail = (cuti: Cuti) => {
    setSelectedCuti(cuti);
    setDetailDialogOpen(true);
  };

  const handleDeleteClick = (cuti: Cuti) => {
    setDeletingCuti(cuti);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCuti) return;

    try {
      setIsDeleting(true);
      await removeCuti(deletingCuti.id);
      toast.success("Cuti berhasil dihapus");
      setDeleteDialogOpen(false);
      setDeletingCuti(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus cuti";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprove = async (cuti: Cuti) => {
    try {
      await approveCuti(cuti.id);
      toast.success("Cuti berhasil disetujui");
      await refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menyetujui cuti";
      toast.error(errorMessage);
    }
  };

  const handleReject = async (cuti: Cuti) => {
    try {
      await rejectCuti(cuti.id);
      toast.success("Cuti berhasil ditolak");
      await refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menolak cuti";
      toast.error(errorMessage);
    }
  };

  const handleApproved = async () => {
    await refetch();
  };

  const handleRejected = async () => {
    await refetch();
  };

  const isAdmin = hasRole('Admin') || hasRole('Owner');

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
                <BreadcrumbPage>Cuti</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <CalendarDays className="h-6 w-6" />
                Daftar Cuti
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <HasCan role={["Admin", "Owner", "Karyawan"]}>
                <Button asChild>
                  <a href="/dashboard/cuti/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajukan Cuti
                  </a>
                </Button>
              </HasCan>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="diajukan">Diajukan</SelectItem>
                  <SelectItem value="disetujui">Disetujui</SelectItem>
                  <SelectItem value="ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
              <Select value={jenisFilter} onValueChange={setJenisFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Jenis</SelectItem>
                  <SelectItem value="cuti">Cuti</SelectItem>
                  <SelectItem value="izin">Izin</SelectItem>
                  <SelectItem value="sakit">Sakit</SelectItem>
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Cuti
              </div>
              <div className="text-2xl font-bold mt-1">
                {loading ? "..." : stats.total}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Diajukan
              </div>
              <div className="text-2xl font-bold mt-1 text-yellow-600">
                {loading ? "..." : stats.totalDiajukan}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Disetujui
              </div>
              <div className="text-2xl font-bold mt-1 text-green-600">
                {loading ? "..." : stats.totalDisetujui}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Ditolak
              </div>
              <div className="text-2xl font-bold mt-1 text-red-600">
                {loading ? "..." : stats.totalDitolak}
              </div>
            </div>
          </div>

          {/* Cuti Table */}
          <CutiTable
            cuti={cuti}
            loading={loading}
            onViewDetail={handleViewDetail}
            onDelete={isAdmin ? handleDeleteClick : undefined}
            onApprove={isAdmin ? handleApprove : undefined}
            onReject={isAdmin ? handleReject : undefined}
          />
        </div>
      </SidebarInset>

      {/* Detail Dialog */}
      <CutiDetailDialog
        cuti={selectedCuti}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onApproved={handleApproved}
        onRejected={handleRejected}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Cuti</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengajuan cuti untuk &quot;
              {deletingCuti?.employee?.user?.name || deletingCuti?.employee?.kode_karyawan || `ID: ${deletingCuti?.id}`}
              &quot; pada tanggal {deletingCuti?.tanggal ? new Date(deletingCuti.tanggal).toLocaleDateString('id-ID') : ''}? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingCuti(null);
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

