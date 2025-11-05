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
import type { Absensi } from "@/lib/types/absensi";
import { Clock } from "lucide-react";

interface AbsensiTableProps {
  absensi: Absensi[];
  loading?: boolean;
  className?: string;
}

export function AbsensiTable({
  absensi,
  loading = false,
  className,
}: AbsensiTableProps) {
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      hadir: 'Hadir',
      izin: 'Izin',
      sakit: 'Sakit',
      alpa: 'Alpa',
    };
    return labels[status] || status;
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      hadir: 'default',
      izin: 'secondary',
      sakit: 'outline',
      alpa: 'destructive',
    };
    return variants[status] || 'outline';
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

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '-';
    // Format H:i:s to HH:mm
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
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
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Jam Masuk</TableHead>
                  <TableHead className="min-w-[100px]">Jam Pulang</TableHead>
                  <TableHead className="min-w-[150px]">Durasi Kerja</TableHead>
                  <TableHead className="min-w-[100px]">Sumber</TableHead>
                  <TableHead className="min-w-[200px]">Catatan</TableHead>
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
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
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

  if (absensi.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-lg border p-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tidak ada absensi ditemukan</h3>
          <p className="text-sm text-muted-foreground">
            Belum ada data absensi.
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
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Jam Masuk</TableHead>
                <TableHead className="min-w-[100px]">Jam Pulang</TableHead>
                <TableHead className="min-w-[150px]">Durasi Kerja</TableHead>
                <TableHead className="min-w-[100px]">Sumber</TableHead>
                <TableHead className="min-w-[200px]">Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {absensi.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {formatDate(item.tanggal)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.employee?.user?.name || item.employee?.kode_karyawan || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status_kehadiran)}>
                      {getStatusLabel(item.status_kehadiran)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    {formatTime(item.jam_masuk)}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    {formatTime(item.jam_pulang)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.durasi_kerja_formatted || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.sumber_absen || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.catatan || '-'}
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



