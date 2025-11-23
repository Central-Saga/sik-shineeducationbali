"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { SesiKerjaFormData } from "@/lib/types/sesi-kerja";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SesiKerjaFormProps {
  initialData?: Partial<SesiKerjaFormData> & {
    id?: number;
  };
  onSubmit: (data: SesiKerjaFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  className?: string;
  isEditing?: boolean;
}

export function SesiKerjaForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Simpan Sesi Kerja",
  className,
  isEditing = false,
}: SesiKerjaFormProps) {
  // Helper function to normalize time format to HH:mm:ss
  const normalizeTime = React.useCallback((time: string | undefined | null): string => {
    if (!time) return '08:00:00';
    const parts = time.split(':');
    if (parts.length === 2) {
      // HH:mm -> HH:mm:ss
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
    } else if (parts.length === 3) {
      // HH:mm:ss -> ensure leading zeros
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
    }
    return time;
  }, []);

  const [formData, setFormData] = React.useState<SesiKerjaFormData>(() => {
    return {
      kategori: initialData?.kategori || 'coding',
      mata_pelajaran: initialData?.mata_pelajaran || '',
      hari: initialData?.hari || 'senin',
      jam_mulai: normalizeTime(initialData?.jam_mulai) || '08:00:00',
      jam_selesai: normalizeTime(initialData?.jam_selesai) || '09:00:00',
      tarif: initialData?.tarif || 30000,
      status: initialData?.status || 'aktif',
    };
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Client-side validation
    const newErrors: Record<string, string> = {};

    if (!formData.kategori) {
      newErrors.kategori = "Kategori wajib dipilih.";
    }
    if (!formData.hari) {
      newErrors.hari = "Hari wajib dipilih.";
    }
    // Normalize time format to HH:mm:ss if needed (do this first)
    const normalizedJamMulai = normalizeTime(formData.jam_mulai);
    const normalizedJamSelesai = normalizeTime(formData.jam_selesai);
    
    // Validate required fields
    if (!normalizedJamMulai) {
      newErrors.jam_mulai = "Jam mulai wajib diisi.";
    }
    if (!normalizedJamSelesai) {
      newErrors.jam_selesai = "Jam selesai wajib diisi.";
    }
    
    if (normalizedJamMulai && normalizedJamSelesai) {
      // Handle both HH:mm and HH:mm:ss formats for comparison
      const mulaiParts = normalizedJamMulai.split(':');
      const selesaiParts = normalizedJamSelesai.split(':');
      const mulaiHour = parseInt(mulaiParts[0]) || 0;
      const mulaiMin = parseInt(mulaiParts[1]) || 0;
      const selesaiHour = parseInt(selesaiParts[0]) || 0;
      const selesaiMin = parseInt(selesaiParts[1]) || 0;
      const mulaiTotal = mulaiHour * 60 + mulaiMin;
      const selesaiTotal = selesaiHour * 60 + selesaiMin;
      if (selesaiTotal <= mulaiTotal) {
        newErrors.jam_selesai = "Jam selesai harus lebih besar dari jam mulai.";
      }
    }
    if (!formData.tarif || formData.tarif < 0) {
      newErrors.tarif = "Tarif wajib diisi dan minimal 0.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Final validation - ensure format is exactly HH:mm:ss before submitting
    // Double check and force normalize one more time
    let finalJamMulai = normalizeTime(normalizedJamMulai);
    let finalJamSelesai = normalizeTime(normalizedJamSelesai);
    
    // Validate format with strict regex
    const timeFormatRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timeFormatRegex.test(finalJamMulai)) {
      // Last resort: try to fix it
      finalJamMulai = normalizeTime(finalJamMulai);
      if (!timeFormatRegex.test(finalJamMulai)) {
        newErrors.jam_mulai = "Format jam mulai harus HH:mm:ss (contoh: 08:00:00).";
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }
    }
    if (!timeFormatRegex.test(finalJamSelesai)) {
      // Last resort: try to fix it
      finalJamSelesai = normalizeTime(finalJamSelesai);
      if (!timeFormatRegex.test(finalJamSelesai)) {
        newErrors.jam_selesai = "Format jam selesai harus HH:mm:ss (contoh: 09:00:00).";
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }
    }

    // Use normalized times for submission - ensure they are strings
    // Remove nomor_sesi from submit data (will be auto-generated by backend)
    const submitData = {
      kategori: formData.kategori,
      mata_pelajaran: formData.mata_pelajaran || null,
      hari: formData.hari,
      jam_mulai: String(finalJamMulai),
      jam_selesai: String(finalJamSelesai),
      tarif: formData.tarif,
      status: formData.status || 'aktif',
    };

    try {
      await onSubmit(submitData);
    } catch (error: unknown) {
      // Handle API validation errors
      const apiError = error as { errors?: Record<string, string | string[]>; message?: string };
      if (apiError?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.keys(apiError.errors).forEach((key) => {
          const errorValue = apiError.errors![key];
          apiErrors[key] = Array.isArray(errorValue)
            ? errorValue[0]
            : String(errorValue);
        });
        setErrors(apiErrors);
      } else {
        setErrors({ submit: apiError?.message || "Gagal menyimpan sesi kerja" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Informasi Sesi Kerja */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Sesi Kerja</CardTitle>
          <CardDescription>
            Isi detail jadwal sesi kerja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kategori">
                Kategori <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.kategori}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, kategori: value as 'coding' | 'non_coding' }));
                  // Auto-set tarif based on kategori
                  if (value === 'coding') {
                    setFormData(prev => ({ ...prev, tarif: 30000 }));
                  } else {
                    setFormData(prev => ({ ...prev, tarif: 25000 }));
                  }
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.kategori;
                    return newErrors;
                  });
                }}
              >
                <SelectTrigger
                  id="kategori"
                  aria-invalid={!!errors.kategori}
                  className={errors.kategori ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="non_coding">Non-Coding</SelectItem>
                </SelectContent>
              </Select>
              {errors.kategori && (
                <p className="text-sm text-destructive">{errors.kategori}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mata_pelajaran">
                Mata Pelajaran
              </Label>
              <Input
                id="mata_pelajaran"
                type="text"
                value={formData.mata_pelajaran || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, mata_pelajaran: e.target.value }));
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.mata_pelajaran;
                    return newErrors;
                  });
                }}
                placeholder="Contoh: Python, Matematika, Bahasa Inggris"
                maxLength={255}
                aria-invalid={!!errors.mata_pelajaran}
                className={errors.mata_pelajaran ? "border-destructive" : ""}
              />
              {errors.mata_pelajaran && (
                <p className="text-sm text-destructive">{errors.mata_pelajaran}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Nama mata pelajaran yang diajar (opsional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hari">
                Hari <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.hari}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, hari: value as 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' }));
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.hari;
                    return newErrors;
                  });
                }}
              >
                <SelectTrigger
                  id="hari"
                  aria-invalid={!!errors.hari}
                  className={errors.hari ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Pilih hari" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="senin">Senin</SelectItem>
                  <SelectItem value="selasa">Selasa</SelectItem>
                  <SelectItem value="rabu">Rabu</SelectItem>
                  <SelectItem value="kamis">Kamis</SelectItem>
                  <SelectItem value="jumat">Jumat</SelectItem>
                  <SelectItem value="sabtu">Sabtu</SelectItem>
                </SelectContent>
              </Select>
              {errors.hari && (
                <p className="text-sm text-destructive">{errors.hari}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Status
              </Label>
              <Select
                value={formData.status || 'aktif'}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, status: value as 'aktif' | 'non aktif' }));
                }}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="non aktif">Non Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jam_mulai">
                Jam Mulai <span className="text-destructive">*</span>
              </Label>
              <Input
                id="jam_mulai"
                type="time"
                step="1"
                value={formData.jam_mulai ? formData.jam_mulai.substring(0, 5) : ''}
                onChange={(e) => {
                  const timeValue = e.target.value;
                  // Convert HH:mm to HH:mm:ss using normalizeTime
                  const timeWithSeconds = normalizeTime(timeValue || '08:00:00');
                  setFormData(prev => ({ ...prev, jam_mulai: timeWithSeconds }));
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.jam_mulai;
                    return newErrors;
                  });
                }}
                aria-invalid={!!errors.jam_mulai}
                className={errors.jam_mulai ? "border-destructive" : ""}
              />
              {errors.jam_mulai && (
                <p className="text-sm text-destructive">{errors.jam_mulai}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jam_selesai">
                Jam Selesai <span className="text-destructive">*</span>
              </Label>
              <Input
                id="jam_selesai"
                type="time"
                step="1"
                value={formData.jam_selesai ? formData.jam_selesai.substring(0, 5) : ''}
                onChange={(e) => {
                  const timeValue = e.target.value;
                  // Convert HH:mm to HH:mm:ss using normalizeTime
                  const timeWithSeconds = normalizeTime(timeValue || '09:00:00');
                  setFormData(prev => ({ ...prev, jam_selesai: timeWithSeconds }));
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.jam_selesai;
                    return newErrors;
                  });
                }}
                aria-invalid={!!errors.jam_selesai}
                className={errors.jam_selesai ? "border-destructive" : ""}
              />
              {errors.jam_selesai && (
                <p className="text-sm text-destructive">{errors.jam_selesai}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarif">
                Tarif (Rp) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tarif"
                type="number"
                min="0"
                step="0.01"
                value={formData.tarif || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string, then parse to number
                  const numValue = value === '' ? 0 : parseFloat(value);
                  setFormData(prev => ({ ...prev, tarif: isNaN(numValue) ? 0 : numValue }));
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.tarif;
                    return newErrors;
                  });
                }}
                onBlur={(e) => {
                  // Ensure value is not empty on blur
                  if (e.target.value === '' || parseFloat(e.target.value) < 0) {
                    setFormData(prev => ({ ...prev, tarif: 0 }));
                  }
                }}
                aria-invalid={!!errors.tarif}
                className={errors.tarif ? "border-destructive" : ""}
              />
              {errors.tarif && (
                <p className="text-sm text-destructive">{errors.tarif}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Coding: Rp 30.000, Non-Coding: Rp 25.000
              </p>
            </div>
          </div>

          {errors.submit && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Batal
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

