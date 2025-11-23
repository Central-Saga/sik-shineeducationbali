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
import { SesiKerjaTable } from "@/components/sesi-kerja/sesi-kerja-table";
import { SesiKerjaDetailDialog } from "@/components/sesi-kerja/sesi-kerja-detail-dialog";
import { useSesiKerja } from "@/hooks/use-sesi-kerja";
import { toast } from "sonner";
import type { SesiKerja } from "@/lib/types/sesi-kerja";
import { Clock, Plus } from "lucide-react";
import { HasCan } from "@/components/has-can";

export default function SesiKerjaPage() {
  const [kategoriFilter, setKategoriFilter] = React.useState<string>("semua");
  const [hariFilter, setHariFilter] = React.useState<string>("semua");
  const [statusFilter, setStatusFilter] = React.useState<string>("semua");
  const [selectedSesiKerja, setSelectedSesiKerja] = React.useState<SesiKerja | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingSesiKerja, setDeletingSesiKerja] = React.useState<SesiKerja | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Build params based on filters
  const params = React.useMemo(() => {
    const filters: Record<string, string> = {};
    
    if (kategoriFilter !== "semua") {
      filters.kategori = kategoriFilter;
    }
    
    if (hariFilter !== "semua") {
      filters.hari = hariFilter;
    }
    
    if (statusFilter !== "semua") {
      filters.status = statusFilter;
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [kategoriFilter, hariFilter, statusFilter]);

  const { sesiKerja, loading, error, refetch, removeSesiKerja } = useSesiKerja(params);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = sesiKerja.length;
    const totalAktif = sesiKerja.filter(
      (item) => item.status === "aktif"
    ).length;
    const totalNonAktif = sesiKerja.filter(
      (item) => item.status === "non aktif"
    ).length;

    return { total, totalAktif, totalNonAktif };
  }, [sesiKerja]);

  const handleViewDetail = (sesiKerja: SesiKerja) => {
    setSelectedSesiKerja(sesiKerja);
    setDetailDialogOpen(true);
  };

  const handleDeleteClick = (sesiKerja: SesiKerja) => {
    setDeletingSesiKerja(sesiKerja);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSesiKerja) return;

    try {
      setIsDeleting(true);
      await removeSesiKerja(deletingSesiKerja.id);
      toast.success("Sesi kerja berhasil dihapus");
      setDeleteDialogOpen(false);
      setDeletingSesiKerja(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus sesi kerja";
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
                <BreadcrumbPage>Sesi Kerja</BreadcrumbPage>
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
                Daftar Sesi Kerja
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <HasCan permission="mengelola sesi kerja">
                <Button asChild>
                  <a href="/dashboard/sesi-kerja/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Sesi Kerja
                  </a>
                </Button>
              </HasCan>
              <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kategori</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="non_coding">Non-Coding</SelectItem>
                </SelectContent>
              </Select>
              <Select value={hariFilter} onValueChange={setHariFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Hari" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Hari</SelectItem>
                  <SelectItem value="senin">Senin</SelectItem>
                  <SelectItem value="selasa">Selasa</SelectItem>
                  <SelectItem value="rabu">Rabu</SelectItem>
                  <SelectItem value="kamis">Kamis</SelectItem>
                  <SelectItem value="jumat">Jumat</SelectItem>
                  <SelectItem value="sabtu">Sabtu</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="non aktif">Non Aktif</SelectItem>
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
                Total Sesi
              </div>
              <div className="text-2xl font-bold mt-1">
                {loading ? "..." : stats.total}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Aktif
              </div>
              <div className="text-2xl font-bold mt-1 text-green-600">
                {loading ? "..." : stats.totalAktif}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Non Aktif
              </div>
              <div className="text-2xl font-bold mt-1 text-gray-600">
                {loading ? "..." : stats.totalNonAktif}
              </div>
            </div>
          </div>

          {/* Sesi Kerja Table */}
          <SesiKerjaTable
            sesiKerja={sesiKerja}
            loading={loading}
            onViewDetail={handleViewDetail}
            onDelete={handleDeleteClick}
          />
        </div>
      </SidebarInset>

      {/* Detail Dialog */}
      <SesiKerjaDetailDialog
        sesiKerja={selectedSesiKerja}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Sesi Kerja</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus sesi kerja &quot;
              {deletingSesiKerja?.kategori === 'coding' ? 'Coding' : 'Non-Coding'} - {deletingSesiKerja?.hari.charAt(0).toUpperCase() + deletingSesiKerja?.hari.slice(1)} - Sesi {deletingSesiKerja?.nomor_sesi}
              &quot;? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingSesiKerja(null);
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

