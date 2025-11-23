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
import { RealisasiSesiTable } from "@/components/realisasi-sesi/realisasi-sesi-table";
import { RealisasiSesiDetailDialog } from "@/components/realisasi-sesi/realisasi-sesi-detail-dialog";
import { RealisasiSesiApproveDialog } from "@/components/realisasi-sesi/realisasi-sesi-approve-dialog";
import { RealisasiSesiRejectDialog } from "@/components/realisasi-sesi/realisasi-sesi-reject-dialog";
import { useRealisasiSesi } from "@/hooks/use-realisasi-sesi";
import { toast } from "sonner";
import type { RealisasiSesi } from "@/lib/types/realisasi-sesi";
import { Clock, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { HasCan } from "@/components/has-can";
import { getMyEmployee } from "@/lib/api/employees";

export default function RealisasiSesiPage() {
  const { user, hasRole } = useAuth();
  const [statusFilter, setStatusFilter] = React.useState<string>("semua");
  const [sumberFilter, setSumberFilter] = React.useState<string>("semua");
  const [dateFilter, setDateFilter] = React.useState<string>("semua");
  const [selectedRealisasiSesi, setSelectedRealisasiSesi] = React.useState<RealisasiSesi | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = React.useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingRealisasiSesi, setDeletingRealisasiSesi] = React.useState<RealisasiSesi | null>(null);
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
      filters.status = statusFilter;
    }
    
    if (sumberFilter !== "semua") {
      filters.sumber = sumberFilter;
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
  }, [statusFilter, sumberFilter, dateFilter, hasRole, employeeId]);

  const { realisasiSesi, loading, error, refetch, removeRealisasiSesi, approveRealisasiSesi, rejectRealisasiSesi } = useRealisasiSesi(params);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = realisasiSesi.length;
    const totalDiajukan = realisasiSesi.filter(
      (item) => item.status === "diajukan"
    ).length;
    const totalDisetujui = realisasiSesi.filter(
      (item) => item.status === "disetujui"
    ).length;
    const totalDitolak = realisasiSesi.filter(
      (item) => item.status === "ditolak"
    ).length;

    return { total, totalDiajukan, totalDisetujui, totalDitolak };
  }, [realisasiSesi]);

  const handleViewDetail = (realisasiSesi: RealisasiSesi) => {
    setSelectedRealisasiSesi(realisasiSesi);
    setDetailDialogOpen(true);
  };

  const handleApproveClick = (realisasiSesi: RealisasiSesi) => {
    setSelectedRealisasiSesi(realisasiSesi);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (realisasiSesi: RealisasiSesi) => {
    setSelectedRealisasiSesi(realisasiSesi);
    setRejectDialogOpen(true);
  };

  const handleApprove = async (id: number | string, catatan?: string) => {
    try {
      await approveRealisasiSesi(id, catatan);
      toast.success("Realisasi sesi berhasil disetujui");
      setApproveDialogOpen(false);
      setSelectedRealisasiSesi(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menyetujui realisasi sesi";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleReject = async (id: number | string, catatan: string) => {
    try {
      await rejectRealisasiSesi(id, catatan);
      toast.success("Realisasi sesi berhasil ditolak");
      setRejectDialogOpen(false);
      setSelectedRealisasiSesi(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menolak realisasi sesi";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDeleteClick = (realisasiSesi: RealisasiSesi) => {
    setDeletingRealisasiSesi(realisasiSesi);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRealisasiSesi) return;

    try {
      setIsDeleting(true);
      await removeRealisasiSesi(deletingRealisasiSesi.id);
      toast.success("Realisasi sesi berhasil dihapus");
      setDeleteDialogOpen(false);
      setDeletingRealisasiSesi(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus realisasi sesi";
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
                <BreadcrumbPage>Realisasi Sesi</BreadcrumbPage>
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
                Daftar Realisasi Sesi
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <HasCan permission="mengajukan realisasi sesi">
                <Button asChild>
                  <a href="/dashboard/realisasi-sesi/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajukan Realisasi Sesi
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
              <Select value={sumberFilter} onValueChange={setSumberFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Sumber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Sumber</SelectItem>
                  <SelectItem value="jadwal">Jadwal</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
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
                Total
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

          {/* Realisasi Sesi Table */}
          <RealisasiSesiTable
            realisasiSesi={realisasiSesi}
            loading={loading}
            onViewDetail={handleViewDetail}
            onDelete={handleDeleteClick}
            onApprove={handleApproveClick}
            onReject={handleRejectClick}
            showActions={true}
          />
        </div>
      </SidebarInset>

      {/* Detail Dialog */}
      <RealisasiSesiDetailDialog
        realisasiSesi={selectedRealisasiSesi}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/* Approve Dialog */}
      <RealisasiSesiApproveDialog
        realisasiSesi={selectedRealisasiSesi}
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        onApprove={handleApprove}
      />

      {/* Reject Dialog */}
      <RealisasiSesiRejectDialog
        realisasiSesi={selectedRealisasiSesi}
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onReject={handleReject}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Realisasi Sesi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus realisasi sesi untuk &quot;
              {deletingRealisasiSesi?.employee?.user?.name || deletingRealisasiSesi?.employee?.kode_karyawan || `ID: ${deletingRealisasiSesi?.id}`}
              &quot; pada tanggal {deletingRealisasiSesi?.tanggal ? new Date(deletingRealisasiSesi.tanggal).toLocaleDateString('id-ID') : ''}? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingRealisasiSesi(null);
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

