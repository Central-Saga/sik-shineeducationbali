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

interface RealisasiSesiApproveDialogProps {
  realisasiSesi: RealisasiSesi | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: number | string, catatan?: string) => Promise<void>;
}

export function RealisasiSesiApproveDialog({
  realisasiSesi,
  open,
  onOpenChange,
  onApprove,
}: RealisasiSesiApproveDialogProps) {
  const [catatan, setCatatan] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setCatatan('');
      setError(null);
    }
  }, [open]);

  const handleApprove = async () => {
    if (!realisasiSesi) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await onApprove(realisasiSesi.id, catatan.trim() || undefined);
      onOpenChange(false);
    } catch (err) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Gagal menyetujui realisasi sesi');
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
          <DialogTitle>Setujui Realisasi Sesi</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menyetujui realisasi sesi ini? Tindakan ini akan mengubah status menjadi "Disetujui".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan (Opsional)</Label>
            <Textarea
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan persetujuan (opsional)"
              rows={3}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
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
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyetujui...
              </>
            ) : (
              'Setujui'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

