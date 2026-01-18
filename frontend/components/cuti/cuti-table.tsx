"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Cuti } from "@/lib/types/cuti";
import { Eye, Trash2, CheckCircle2, XCircle, X, Ban } from "lucide-react";

interface CutiTableProps {
  cuti: Cuti[];
  loading?: boolean;
  className?: string;
  onViewDetail?: (cuti: Cuti) => void;
  onDelete?: (cuti: Cuti) => void;
  onApprove?: (cuti: Cuti) => void;
  onReject?: (cuti: Cuti) => void;
  onCancel?: (cuti: Cuti) => void;
  onRequestCancellation?: (cuti: Cuti) => void;
  onApproveCancellation?: (cuti: Cuti) => void;
  onRejectCancellation?: (cuti: Cuti) => void;
  showActions?: boolean;
  isKaryawan?: boolean;
  isAdmin?: boolean;
}

export function CutiTable({
  cuti,
  loading = false,
  className,
  onViewDetail,
  onDelete,
  onApprove,
  onReject,
  onCancel,
  onRequestCancellation,
  onApproveCancellation,
  onRejectCancellation,
  showActions = true,
  isKaryawan = false,
  isAdmin = false,
}: CutiTableProps) {
  const getJenisLabel = (jenis: string) => {
    const labels: Record<string, string> = {
      cuti: 'Cuti',
      izin: 'Izin',
      sakit: 'Sakit',
    };
    return labels[jenis] || jenis;
  };

  const getJenisBadgeVariant = (jenis: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      cuti: 'default',
      izin: 'secondary',
      sakit: 'destructive',
    };
    return variants[jenis] || 'outline';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      diajukan: 'Diajukan',
      disetujui: 'Disetujui',
      ditolak: 'Ditolak',
      dibatalkan: 'Dibatalkan',
      pembatalan_diajukan: 'Pembatalan Diajukan',
    };
    return labels[status] || status;
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "success" | "danger" | "secondary" | "outline" | "destructive"> = {
      diajukan: 'secondary',
      disetujui: 'success',
      ditolak: 'danger',
      dibatalkan: 'destructive',
      pembatalan_diajukan: 'secondary',
    };
    return variants[status] || 'outline';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('id-ID', { weekday: 'short' });
    const formatted = date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    // Capitalize first letter of weekday (KBBI format)
    return weekday.charAt(0).toUpperCase() + weekday.slice(1) + ', ' + formatted;
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Tanggal</TableHead>
                  <TableHead className="min-w-[200px]">Nama Karyawan</TableHead>
                  <TableHead className="min-w-[100px]">Jenis</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[200px]">Catatan</TableHead>
                  {showActions && (
                    <TableHead className="min-w-[120px] text-right">Aksi</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    {showActions && (
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-24 ml-auto" />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  if (cuti.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-lg border p-12 text-center">
          <div className="mx-auto h-12 w-12 text-muted-foreground mb-4 flex items-center justify-center">
            📅
          </div>
          <h3 className="text-lg font-semibold mb-2">Tidak ada cuti ditemukan</h3>
          <p className="text-sm text-muted-foreground">
            Belum ada data pengajuan cuti.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Tanggal</TableHead>
                <TableHead className="min-w-[200px]">Nama Karyawan</TableHead>
                <TableHead className="min-w-[100px]">Jenis</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[200px]">Catatan</TableHead>
                {showActions && (
                  <TableHead className="min-w-[120px] text-right">Aksi</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuti.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {formatDate(item.tanggal)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.employee?.user?.name || item.employee?.kode_karyawan || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getJenisBadgeVariant(item.jenis)}>
                      {getJenisLabel(item.jenis)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="max-w-[300px] truncate" title={item.catatan || '-'}>
                      {item.catatan || '-'}
                    </div>
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onViewDetail && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetail(item)}
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Lihat Detail</span>
                          </Button>
                        )}
                        {onApprove && item.status === 'diajukan' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onApprove(item)}
                            title="Setujui"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="sr-only">Setujui</span>
                          </Button>
                        )}
                        {onReject && item.status === 'diajukan' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReject(item)}
                            title="Tolak"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Tolak</span>
                          </Button>
                        )}
                        {/* Kondisi A: Batalkan untuk status "diajukan" (hanya karyawan pemilik) */}
                        {onCancel && item.status === 'diajukan' && isKaryawan && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCancel(item)}
                            title="Batalkan"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <Ban className="h-4 w-4" />
                            <span className="sr-only">Batalkan</span>
                          </Button>
                        )}
                        {/* Kondisi B: Ajukan Pembatalan untuk status "disetujui" (hanya karyawan pemilik) */}
                        {onRequestCancellation && item.status === 'disetujui' && isKaryawan && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRequestCancellation(item)}
                            title="Ajukan Pembatalan"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Ajukan Pembatalan</span>
                          </Button>
                        )}
                        {/* Admin: Setujui/Tolak Pembatalan untuk status "pembatalan_diajukan" */}
                        {onApproveCancellation && item.status === 'pembatalan_diajukan' && isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onApproveCancellation(item)}
                            title="Setujui Pembatalan"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="sr-only">Setujui Pembatalan</span>
                          </Button>
                        )}
                        {onRejectCancellation && item.status === 'pembatalan_diajukan' && isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRejectCancellation(item)}
                            title="Tolak Pembatalan"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Tolak Pembatalan</span>
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item)}
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Hapus</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

