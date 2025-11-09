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
import type { Absensi } from "@/lib/types/absensi";
import type { LogAbsensi } from "@/lib/types/log-absensi";
import { getLogAbsensiCheckIn, getLogAbsensiCheckOut } from "@/lib/api/log-absensi";
import { MapPin, Clock, CheckCircle2, XCircle, Camera, Navigation } from "lucide-react";

interface AbsensiDetailDialogProps {
  absensi: Absensi | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AbsensiDetailDialog({
  absensi,
  open,
  onOpenChange,
}: AbsensiDetailDialogProps) {
  const [checkInLog, setCheckInLog] = React.useState<LogAbsensi | null>(null);
  const [checkOutLog, setCheckOutLog] = React.useState<LogAbsensi | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && absensi) {
      const loadLogs = async () => {
        setLoading(true);
        try {
          const [checkIn, checkOut] = await Promise.all([
            getLogAbsensiCheckIn(absensi.id),
            getLogAbsensiCheckOut(absensi.id),
          ]);
          setCheckInLog(checkIn);
          setCheckOutLog(checkOut);
        } catch (error) {
          console.error("Failed to load log absensi:", error);
        } finally {
          setLoading(false);
        }
      };
      loadLogs();
    } else {
      setCheckInLog(null);
      setCheckOutLog(null);
    }
  }, [open, absensi]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return "-";
    const parts = timeString.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  if (!absensi) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Absensi</DialogTitle>
          <DialogDescription>
            Informasi lengkap absensi dan log check-in/check-out
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informasi Absensi */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Absensi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Karyawan</p>
                <p className="font-medium">
                  {absensi.employee?.user?.name || absensi.employee?.kode_karyawan || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal</p>
                <p className="font-medium">{formatDate(absensi.tanggal)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={
                    absensi.status_kehadiran === "hadir" ? "default" : "secondary"
                  }
                >
                  {absensi.status_kehadiran === "hadir" ? "Hadir" : "Izin"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jam Masuk</p>
                <p className="font-medium font-mono">
                  {formatTime(absensi.jam_masuk)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jam Pulang</p>
                <p className="font-medium font-mono">
                  {formatTime(absensi.jam_pulang)}
                </p>
              </div>
              {absensi.durasi_kerja_formatted && (
                <div>
                  <p className="text-sm text-muted-foreground">Durasi Kerja</p>
                  <p className="font-medium">{absensi.durasi_kerja_formatted}</p>
                </div>
              )}
              {absensi.catatan && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Catatan</p>
                  <p className="font-medium">{absensi.catatan}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Log Check In */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Check In
            </h3>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : checkInLog ? (
              <div className="rounded-lg border p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Waktu
                    </p>
                    <p className="font-medium">
                      {checkInLog.waktu ? formatDateTime(checkInLog.waktu) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      Koordinat
                    </p>
                    <p className="font-medium font-mono text-sm">
                      {checkInLog.latitude && checkInLog.longitude
                        ? `${checkInLog.latitude.toFixed(6)}, ${checkInLog.longitude.toFixed(6)}`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Akurasi GPS</p>
                    <p className="font-medium">
                      {checkInLog.akurasi_formatted || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Radius dari Titik Utama
                    </p>
                    <p className="font-medium">
                      {checkInLog.distance !== null && checkInLog.distance !== undefined
                        ? `${checkInLog.distance.toFixed(2)} meter`
                        : "Tidak tersedia"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Validasi GPS</p>
                    <Badge
                      variant={checkInLog.validasi_gps ? "default" : "destructive"}
                      className="flex items-center gap-1 w-fit"
                    >
                      {checkInLog.validasi_gps ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Valid
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Tidak Valid
                        </>
                      )}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sumber</p>
                    <p className="font-medium">
                      {checkInLog.sumber_label || checkInLog.sumber}
                    </p>
                  </div>
                </div>
                {checkInLog.foto_selfie && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                      <Camera className="h-3 w-3" />
                      Foto Selfie
                    </p>
                    <img
                      src={checkInLog.foto_selfie}
                      alt="Foto selfie check-in"
                      className="rounded-lg border max-w-xs max-h-48 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                Belum check-in
              </div>
            )}
          </div>

          <Separator />

          {/* Log Check Out */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Check Out
            </h3>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : checkOutLog ? (
              <div className="rounded-lg border p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Waktu
                    </p>
                    <p className="font-medium">
                      {checkOutLog.waktu ? formatDateTime(checkOutLog.waktu) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      Koordinat
                    </p>
                    <p className="font-medium font-mono text-sm">
                      {checkOutLog.latitude && checkOutLog.longitude
                        ? `${checkOutLog.latitude.toFixed(6)}, ${checkOutLog.longitude.toFixed(6)}`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Akurasi GPS</p>
                    <p className="font-medium">
                      {checkOutLog.akurasi_formatted || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Radius dari Titik Utama
                    </p>
                    <p className="font-medium">
                      {checkOutLog.distance !== null && checkOutLog.distance !== undefined
                        ? `${checkOutLog.distance.toFixed(2)} meter`
                        : "Tidak tersedia"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Validasi GPS</p>
                    <Badge
                      variant={checkOutLog.validasi_gps ? "default" : "destructive"}
                      className="flex items-center gap-1 w-fit"
                    >
                      {checkOutLog.validasi_gps ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Valid
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Tidak Valid
                        </>
                      )}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sumber</p>
                    <p className="font-medium">
                      {checkOutLog.sumber_label || checkOutLog.sumber}
                    </p>
                  </div>
                </div>
                {checkOutLog.foto_selfie && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                      <Camera className="h-3 w-3" />
                      Foto Selfie
                    </p>
                    <img
                      src={checkOutLog.foto_selfie}
                      alt="Foto selfie check-out"
                      className="rounded-lg border max-w-xs max-h-48 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                Belum check-out
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



