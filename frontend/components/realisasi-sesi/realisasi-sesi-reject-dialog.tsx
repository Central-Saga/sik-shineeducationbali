"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { RealisasiSesi } from "@/lib/types/realisasi-sesi";

interface RealisasiSesiRejectDialogProps {
  realisasiSesi: RealisasiSesi | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (id: number | string, catatan: string) => Promise<void>;
}

export function RealisasiSesiRejectDialog({
  realisasiSesi,
  open,
  onOpenChange,
  onReject,
}: RealisasiSesiRejectDialogProps) {
  const [catatan, setCatatan] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setCatatan('');
      setError(null);
    }
  }, [open]);

  const handleReject = async () => {
    if (!realisasiSesi) return;

    setError(null);

    // Validation
    if (!catatan.trim()) {
      setError('Catatan wajib diisi untuk penolakan');
      return;
    }

    if (catatan.trim().length < 3) {
      setError('Catatan minimal 3 karakter');
      return;
    }

    setIsSubmitting(true);

    try {
      await onReject(realisasiSesi.id, catatan.trim());
      onOpenChange(false);
    } catch (err) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Gagal menolak realisasi sesi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!realisasiSesi) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tolak Realisasi Sesi</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menolak realisasi sesi ini? Tindakan ini akan mengubah status menjadi "Ditolak". Catatan penolakan wajib diisi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="catatan">
              Catatan Penolakan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="catatan"
              value={catatan}
              onChange={(e) => {
                setCatatan(e.target.value);
                setError(null);
              }}
              placeholder="Alasan penolakan (wajib diisi)"
              rows={4}
              aria-invalid={!!error}
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            onClick={handleReject}
            disabled={isSubmitting || !catatan.trim()}
            variant="destructive"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menolak...
              </>
            ) : (
              'Tolak'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

