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
import type { RealisasiSesi } from "@/lib/types/realisasi-sesi";
import { Clock, Eye, Trash2, CheckCircle2, XCircle } from "lucide-react";

interface RealisasiSesiTableProps {
  realisasiSesi: RealisasiSesi[];
  loading?: boolean;
  className?: string;
  onViewDetail?: (realisasiSesi: RealisasiSesi) => void;
  onDelete?: (realisasiSesi: RealisasiSesi) => void;
  onApprove?: (realisasiSesi: RealisasiSesi) => void;
  onReject?: (realisasiSesi: RealisasiSesi) => void;
  showActions?: boolean;
}

export function RealisasiSesiTable({
  realisasiSesi,
  loading = false,
  className,
  onViewDetail,
  onDelete,
  onApprove,
  onReject,
  showActions = true,
}: RealisasiSesiTableProps) {
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      diajukan: 'Diajukan',
      disetujui: 'Disetujui',
      ditolak: 'Ditolak',
    };
    return labels[status] || status;
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      diajukan: 'secondary',
      disetujui: 'default',
      ditolak: 'destructive',
    };
    return variants[status] || 'outline';
  };

  const getSumberLabel = (sumber: string) => {
    const labels: Record<string, string> = {
      wajib: 'Wajib',
      lembur: 'Lembur',
    };
    return labels[sumber] || sumber;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
                  <TableHead className="min-w-[150px]">Sesi Kerja</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Sumber</TableHead>
                  <TableHead className="min-w-[200px]">Catatan</TableHead>
                  {showActions && <TableHead className="min-w-[120px] text-right">Aksi</TableHead>}
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
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
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

  if (realisasiSesi.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-lg border p-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tidak ada realisasi sesi ditemukan</h3>
          <p className="text-sm text-muted-foreground">
            Belum ada data realisasi sesi.
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
                <TableHead className="min-w-[150px]">Sesi Kerja</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Sumber</TableHead>
                <TableHead className="min-w-[200px]">Catatan</TableHead>
                {showActions && <TableHead className="min-w-[120px] text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {realisasiSesi.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {formatDate(item.tanggal)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.employee?.user?.name || item.employee?.kode_karyawan || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {item.sesi_kerja ? (
                      <div className="text-sm">
                        <div className="font-medium">
                          {item.sesi_kerja.kategori === 'coding' ? 'Coding' : 'Non-Coding'}
                          {item.sesi_kerja.mata_pelajaran ? ` - ${item.sesi_kerja.mata_pelajaran}` : ''}
                        </div>
                        <div className="text-muted-foreground">{item.sesi_kerja.hari} - Sesi {item.sesi_kerja.nomor_sesi}</div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getSumberLabel(item.sumber)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.catatan || '-'}
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
                            className="text-green-600 hover:text-green-700"
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
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Tolak</span>
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

