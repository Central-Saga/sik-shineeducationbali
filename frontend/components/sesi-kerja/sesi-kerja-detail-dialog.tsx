"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { SesiKerja } from "@/lib/types/sesi-kerja";
import { Clock, Calendar } from "lucide-react";

interface SesiKerjaDetailDialogProps {
  sesiKerja: SesiKerja | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SesiKerjaDetailDialog({
  sesiKerja,
  open,
  onOpenChange,
}: SesiKerjaDetailDialogProps) {
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
    const variants: Record<string, "success" | "danger" | "outline"> = {
      aktif: 'success',
      'non aktif': 'danger',
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!sesiKerja) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Sesi Kerja</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang sesi kerja
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kategori</p>
                <p className="text-base font-semibold">{getKategoriLabel(sesiKerja.kategori)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mata Pelajaran</p>
                <p className="text-base font-semibold">{sesiKerja.mata_pelajaran || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hari</p>
                <p className="text-base font-semibold">{getHariLabel(sesiKerja.hari)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nomor Sesi</p>
                <p className="text-base font-semibold">{sesiKerja.nomor_sesi}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={getStatusBadgeVariant(sesiKerja.status)}>
                  {sesiKerja.status === 'aktif' ? 'Aktif' : 'Non Aktif'}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Jam Mulai</p>
                  <p className="text-base font-semibold font-mono">{formatTime(sesiKerja.jam_mulai)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Jam Selesai</p>
                  <p className="text-base font-semibold font-mono">{formatTime(sesiKerja.jam_selesai)}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">Tarif</p>
              <p className="text-base font-semibold">{formatCurrency(sesiKerja.tarif)}</p>
            </div>
          </div>

          {/* Timestamps */}
          {(sesiKerja.created_at || sesiKerja.updated_at) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Informasi Sistem</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {sesiKerja.created_at && (
                    <div>
                      <p className="text-muted-foreground">Dibuat</p>
                      <p>{formatDate(sesiKerja.created_at)}</p>
                    </div>
                  )}
                  {sesiKerja.updated_at && (
                    <div>
                      <p className="text-muted-foreground">Diperbarui</p>
                      <p>{formatDate(sesiKerja.updated_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

