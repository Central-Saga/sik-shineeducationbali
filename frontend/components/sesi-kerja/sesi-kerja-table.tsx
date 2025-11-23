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
import { Switch } from "@/components/ui/switch";
import type { SesiKerja } from "@/lib/types/sesi-kerja";
import { Clock, Eye, Trash2 } from "lucide-react";

interface SesiKerjaTableProps {
  sesiKerja: SesiKerja[];
  loading?: boolean;
  className?: string;
  onViewDetail?: (sesiKerja: SesiKerja) => void;
  onDelete?: (sesiKerja: SesiKerja) => void;
  onUpdateStatus?: (sesiKerja: SesiKerja, newStatus: 'aktif' | 'non aktif') => void;
}

export function SesiKerjaTable({
  sesiKerja,
  loading = false,
  className,
  onViewDetail,
  onDelete,
  onUpdateStatus,
}: SesiKerjaTableProps) {
  const getKategoriLabel = (kategori: string) => {
    const labels: Record<string, string> = {
      coding: 'Coding',
      non_coding: 'Non-Coding',
    };
    return labels[kategori] || kategori;
  };

  const getHariLabel = (hari: string) => {
    const labels: Record<string, string> = {
      senin: 'Senin',
      selasa: 'Selasa',
      rabu: 'Rabu',
      kamis: 'Kamis',
      jumat: 'Jumat',
      sabtu: 'Sabtu',
    };
    return labels[hari] || hari;
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      aktif: 'default',
      'non aktif': 'secondary',
    };
    return variants[status] || 'outline';
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '-';
    // Format H:i:s to HH:mm
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Kategori</TableHead>
                  <TableHead className="min-w-[150px]">Mata Pelajaran</TableHead>
                  <TableHead className="min-w-[100px]">Hari</TableHead>
                  <TableHead className="min-w-[80px]">Nomor Sesi</TableHead>
                  <TableHead className="min-w-[100px]">Jam Mulai</TableHead>
                  <TableHead className="min-w-[100px]">Jam Selesai</TableHead>
                  <TableHead className="min-w-[120px]">Tarif</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[120px] text-right">Aksi</TableHead>
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
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  if (sesiKerja.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-lg border p-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tidak ada sesi kerja ditemukan</h3>
          <p className="text-sm text-muted-foreground">
            Belum ada data sesi kerja.
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
                <TableHead className="min-w-[100px]">Kategori</TableHead>
                <TableHead className="min-w-[150px]">Mata Pelajaran</TableHead>
                <TableHead className="min-w-[100px]">Hari</TableHead>
                <TableHead className="min-w-[80px]">Nomor Sesi</TableHead>
                <TableHead className="min-w-[100px]">Jam Mulai</TableHead>
                <TableHead className="min-w-[100px]">Jam Selesai</TableHead>
                <TableHead className="min-w-[120px]">Tarif</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sesiKerja.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {getKategoriLabel(item.kategori)}
                  </TableCell>
                  <TableCell>
                    {item.mata_pelajaran || '-'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {getHariLabel(item.hari)}
                  </TableCell>
                  <TableCell>
                    {item.nomor_sesi}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    {formatTime(item.jam_mulai)}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    {formatTime(item.jam_selesai)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCurrency(item.tarif)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {item.status === 'aktif' ? 'Aktif' : 'Non Aktif'}
                      </Badge>
                      {onUpdateStatus && (
                        <Switch
                          checked={item.status === 'aktif'}
                          onCheckedChange={(checked) => {
                            onUpdateStatus(item, checked ? 'aktif' : 'non aktif');
                          }}
                          aria-label={`Toggle status untuk ${item.kategori} - ${item.hari} - Sesi ${item.nomor_sesi}`}
                        />
                      )}
                    </div>
                  </TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

