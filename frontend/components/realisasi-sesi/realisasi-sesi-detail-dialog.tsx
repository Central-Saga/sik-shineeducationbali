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
import { Separator } from "@/components/ui/separator";
import type { RealisasiSesi } from "@/lib/types/realisasi-sesi";
import { Clock, Calendar, User, CheckCircle2, XCircle } from "lucide-react";

interface RealisasiSesiDetailDialogProps {
  realisasiSesi: RealisasiSesi | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RealisasiSesiDetailDialog({
  realisasiSesi,
  open,
  onOpenChange,
}: RealisasiSesiDetailDialogProps) {
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      diajukan: 'Diajukan',
      disetujui: 'Disetujui',
      ditolak: 'Ditolak',
    };
    return labels[status] || status;
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "success" | "danger" | "secondary" | "outline"> = {
      diajukan: 'secondary',
      disetujui: 'success',
      ditolak: 'danger',
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateTimeString: string | undefined) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!realisasiSesi) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Realisasi Sesi</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang realisasi sesi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={getStatusBadgeVariant(realisasiSesi.status)} className="mt-1">
                  {getStatusLabel(realisasiSesi.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sumber</p>
                <p className="text-base font-semibold">{getSumberLabel(realisasiSesi.sumber)}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tanggal</p>
                <p className="text-base font-semibold">{formatDate(realisasiSesi.tanggal)}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Karyawan</p>
                <p className="text-base font-semibold">
                  {realisasiSesi.employee?.user?.name || realisasiSesi.employee?.kode_karyawan || 'N/A'}
                </p>
                {realisasiSesi.employee?.user?.email && (
                  <p className="text-sm text-muted-foreground">{realisasiSesi.employee.user.email}</p>
                )}
              </div>
            </div>

            <Separator />

            {realisasiSesi.sesi_kerja && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sesi Kerja</p>
                <div className="mt-1 space-y-1">
                  <p className="text-base font-semibold">
                    {realisasiSesi.sesi_kerja.kategori === 'coding' ? 'Coding' : 'Non-Coding'}
                    {realisasiSesi.sesi_kerja.mata_pelajaran ? ` - ${realisasiSesi.sesi_kerja.mata_pelajaran}` : ''} - {realisasiSesi.sesi_kerja.hari.charAt(0).toUpperCase() + realisasiSesi.sesi_kerja.hari.slice(1)} - Sesi {realisasiSesi.sesi_kerja.nomor_sesi}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{realisasiSesi.sesi_kerja.jam_mulai?.substring(0, 5)} - {realisasiSesi.sesi_kerja.jam_selesai?.substring(0, 5)}</span>
                    </div>
                    {realisasiSesi.sesi_kerja.tarif && (
                      <span>Tarif: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(realisasiSesi.sesi_kerja.tarif)}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {realisasiSesi.catatan && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Catatan</p>
                  <p className="text-base mt-1">{realisasiSesi.catatan}</p>
                </div>
              </>
            )}

            {realisasiSesi.approved_by && (
              <>
                <Separator />
                <div className="flex items-center gap-2">
                  {realisasiSesi.status === 'disetujui' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {realisasiSesi.status === 'disetujui' ? 'Disetujui oleh' : 'Ditolak oleh'}
                    </p>
                    <p className="text-base font-semibold">{realisasiSesi.approved_by.name}</p>
                    <p className="text-sm text-muted-foreground">{realisasiSesi.approved_by.email}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Timestamps */}
          {(realisasiSesi.created_at || realisasiSesi.updated_at) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Informasi Sistem</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {realisasiSesi.created_at && (
                    <div>
                      <p className="text-muted-foreground">Dibuat</p>
                      <p>{formatDateTime(realisasiSesi.created_at)}</p>
                    </div>
                  )}
                  {realisasiSesi.updated_at && (
                    <div>
                      <p className="text-muted-foreground">Diperbarui</p>
                      <p>{formatDateTime(realisasiSesi.updated_at)}</p>
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

