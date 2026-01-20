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
import { Button } from "@/components/ui/button";
import type { Cuti } from "@/lib/types/cuti";
import { CheckCircle2, XCircle, Calendar, User, FileText, Clock, Ban, X } from "lucide-react";
import { approveCuti, rejectCuti, cancelCuti, requestCancellation, approveCancellation, rejectCancellation } from "@/lib/api/cuti";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface CutiDetailDialogProps {
  cuti: Cuti | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved?: () => void;
  onRejected?: () => void;
  onCancelled?: () => void;
  onCancellationRequested?: () => void;
  onCancellationApproved?: () => void;
  onCancellationRejected?: () => void;
  isKaryawan?: boolean;
}

export function CutiDetailDialog({
  cuti,
  open,
  onOpenChange,
  onApproved,
  onRejected,
  onCancelled,
  onCancellationRequested,
  onCancellationApproved,
  onCancellationRejected,
  isKaryawan = false,
}: CutiDetailDialogProps) {
  const { hasRole } = useAuth();
  const [isProcessing, setIsProcessing] = React.useState(false);

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
    const weekday = date.toLocaleDateString("id-ID", { weekday: "long" });
    const formatted = date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    // Capitalize first letter of weekday (KBBI format)
    return weekday.charAt(0).toUpperCase() + weekday.slice(1) + ', ' + formatted;
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = async () => {
    if (!cuti) return;

    try {
      setIsProcessing(true);
      await approveCuti(cuti.id);
      toast.success("Cuti berhasil disetujui");
      onOpenChange(false);
      if (onApproved) {
        onApproved();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menyetujui cuti";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!cuti) return;

    try {
      setIsProcessing(true);
      await rejectCuti(cuti.id);
      toast.success("Cuti berhasil ditolak");
      onOpenChange(false);
      if (onRejected) {
        onRejected();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menolak cuti";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!cuti) return;

    try {
      setIsProcessing(true);
      await cancelCuti(cuti.id);
      toast.success("Cuti berhasil dibatalkan");
      onOpenChange(false);
      if (onCancelled) {
        onCancelled();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal membatalkan cuti";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestCancellation = async () => {
    if (!cuti) return;

    try {
      setIsProcessing(true);
      await requestCancellation(cuti.id);
      toast.success("Pengajuan pembatalan berhasil dikirim");
      onOpenChange(false);
      if (onCancellationRequested) {
        onCancellationRequested();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal mengajukan pembatalan";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveCancellation = async () => {
    if (!cuti) return;

    try {
      setIsProcessing(true);
      await approveCancellation(cuti.id);
      toast.success("Pembatalan cuti berhasil disetujui");
      onOpenChange(false);
      if (onCancellationApproved) {
        onCancellationApproved();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menyetujui pembatalan";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectCancellation = async () => {
    if (!cuti) return;

    try {
      setIsProcessing(true);
      await rejectCancellation(cuti.id);
      toast.success("Pembatalan cuti berhasil ditolak");
      onOpenChange(false);
      if (onCancellationRejected) {
        onCancellationRejected();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menolak pembatalan";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cuti) return null;

  const isAdmin = hasRole('Admin') || hasRole('Owner');
  const canApprove = isAdmin && cuti.status === 'diajukan';
  const canCancel = isKaryawan && cuti.status === 'diajukan';
  const canRequestCancellation = isKaryawan && cuti.status === 'disetujui';
  const canApproveCancellation = isAdmin && cuti.status === 'pembatalan_diajukan';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pengajuan Cuti</DialogTitle>
          <DialogDescription>
            Informasi lengkap pengajuan izin atau sakit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informasi Karyawan */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Karyawan
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama</p>
                <p className="font-medium">
                  {cuti.employee?.user?.name || cuti.employee?.kode_karyawan || "N/A"}
                </p>
              </div>
              {cuti.employee?.kode_karyawan && (
                <div>
                  <p className="text-sm text-muted-foreground">Kode Karyawan</p>
                  <p className="font-medium">{cuti.employee.kode_karyawan}</p>
                </div>
              )}
              {cuti.employee?.user?.email && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{cuti.employee.user.email}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informasi Cuti */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informasi Cuti
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tanggal</p>
                <p className="font-medium">{formatDate(cuti.tanggal)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jenis</p>
                <Badge variant={getJenisBadgeVariant(cuti.jenis)} className="mt-1">
                  {getJenisLabel(cuti.jenis)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={getStatusBadgeVariant(cuti.status)} className="mt-1">
                  {getStatusLabel(cuti.status)}
                </Badge>
              </div>
              {cuti.approved_by && (
                <div>
                  <p className="text-sm text-muted-foreground">Disetujui Oleh</p>
                  <p className="font-medium">{cuti.approved_by.name}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Catatan / Alasan
                </p>
                <p className="font-medium mt-1 whitespace-pre-wrap">{cuti.catatan || "-"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informasi Timestamp */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Informasi Waktu
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {cuti.created_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Dibuat</p>
                  <p className="font-medium">{formatDateTime(cuti.created_at)}</p>
                </div>
              )}
              {cuti.updated_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Diperbarui</p>
                  <p className="font-medium">{formatDateTime(cuti.updated_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {(canApprove || canCancel || canRequestCancellation || canApproveCancellation) && (
            <>
              <Separator />
              <div className="flex justify-end gap-3">
                {/* Admin: Approve/Reject untuk status "diajukan" */}
                {canApprove && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {isProcessing ? "Memproses..." : "Tolak"}
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {isProcessing ? "Memproses..." : "Setujui"}
                    </Button>
                  </>
                )}
                {/* Karyawan: Batalkan untuk status "diajukan" (Kondisi A) */}
                {canCancel && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isProcessing}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    {isProcessing ? "Memproses..." : "Batalkan"}
                  </Button>
                )}
                {/* Karyawan: Ajukan Pembatalan untuk status "disetujui" (Kondisi B) */}
                {canRequestCancellation && (
                  <Button
                    variant="outline"
                    onClick={handleRequestCancellation}
                    disabled={isProcessing}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {isProcessing ? "Memproses..." : "Ajukan Pembatalan"}
                  </Button>
                )}
                {/* Admin: Setujui/Tolak Pembatalan untuk status "pembatalan_diajukan" */}
                {canApproveCancellation && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleRejectCancellation}
                      disabled={isProcessing}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {isProcessing ? "Memproses..." : "Tolak Pembatalan"}
                    </Button>
                    <Button
                      onClick={handleApproveCancellation}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {isProcessing ? "Memproses..." : "Setujui Pembatalan"}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

