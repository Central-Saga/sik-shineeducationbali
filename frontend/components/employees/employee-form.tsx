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
import type { EmployeeFormData } from "@/lib/types/employee";
import { cn } from "@/lib/utils";

interface EmployeeFormProps {
  initialData?: Partial<EmployeeFormData> & {
    id?: number;
    kode_karyawan?: string;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  className?: string;
  isEditing?: boolean;
}

export function EmployeeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Simpan Karyawan",
  className,
  isEditing = false,
}: EmployeeFormProps) {
  const [formData, setFormData] = React.useState<EmployeeFormData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    kategori_karyawan: initialData?.kategori_karyawan || "tetap",
    subtipe_kontrak: initialData?.subtipe_kontrak || null,
    tipe_gaji: initialData?.tipe_gaji || "bulanan",
    gaji_pokok: initialData?.gaji_pokok || null,
    bank_nama: initialData?.bank_nama || "",
    bank_no_rekening: initialData?.bank_no_rekening || "",
    nomor_hp: initialData?.nomor_hp || "",
    alamat: initialData?.alamat || "",
    tanggal_lahir: initialData?.tanggal_lahir || "",
    status: initialData?.status || "aktif",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Client-side validation
    const newErrors: Record<string, string> = {};
    
    if (!isEditing) {
      if (!formData.name || !formData.name.trim()) {
        newErrors.name = "Nama wajib diisi.";
      }
      if (!formData.email || !formData.email.trim()) {
        newErrors.email = "Email wajib diisi.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Format email tidak valid.";
      }
      if (!formData.password || formData.password.length < 8) {
        newErrors.password = "Password minimal 8 karakter.";
      }
    }
    if (!formData.kategori_karyawan) {
      newErrors.kategori_karyawan = "Kategori karyawan wajib dipilih.";
    }
    if (formData.kategori_karyawan === "kontrak" && !formData.subtipe_kontrak) {
      newErrors.subtipe_kontrak = "Subtipe kontrak wajib dipilih untuk karyawan kontrak.";
    }
    if (!formData.tipe_gaji) {
      newErrors.tipe_gaji = "Tipe gaji wajib dipilih.";
    }
    if (formData.tipe_gaji === "bulanan" && (!formData.gaji_pokok || formData.gaji_pokok <= 0)) {
      newErrors.gaji_pokok = "Gaji pokok wajib diisi untuk tipe gaji bulanan.";
    }
    if (formData.tipe_gaji === "per_sesi" && (!formData.gaji_pokok || formData.gaji_pokok <= 0)) {
      newErrors.gaji_pokok = "Gaji per sesi wajib diisi untuk tipe gaji per sesi.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare data for submission
      const submitData: EmployeeFormData = {
        ...formData,
        // Set null for optional fields that are empty
        subtipe_kontrak: formData.kategori_karyawan === "kontrak" ? formData.subtipe_kontrak : null,
        // gaji_pokok tetap diisi untuk kedua tipe (bulanan dan per_sesi)
        gaji_pokok: formData.gaji_pokok || null,
        bank_nama: formData.bank_nama || null,
        bank_no_rekening: formData.bank_no_rekening || null,
        nomor_hp: formData.nomor_hp || null,
        alamat: formData.alamat || null,
        tanggal_lahir: formData.tanggal_lahir || null,
      };
      
      // Remove name, email, password when editing (these fields are not editable)
      if (isEditing) {
        delete submitData.name;
        delete submitData.email;
        delete submitData.password;
      }
      
      await onSubmit(submitData);
    } catch (error: any) {
      // Handle API validation errors
      if (error?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.keys(error.errors).forEach((key) => {
          apiErrors[key] = Array.isArray(error.errors[key])
            ? error.errors[key][0]
            : error.errors[key];
        });
        setErrors(apiErrors);
      } else {
        setErrors({ submit: error?.message || "Gagal menyimpan karyawan" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Reset dependent fields when parent field changes
      if (field === "kategori_karyawan" && value !== "kontrak") {
        newData.subtipe_kontrak = null;
      }
      // Jangan reset gaji_pokok saat tipe_gaji berubah karena field tetap digunakan untuk kedua tipe
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Informasi Dasar */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
          <CardDescription>
            Masukkan informasi dasar karyawan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nama */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Masukkan nama karyawan"
                aria-invalid={!!errors.name}
                disabled={isSubmitting || isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
          )}

          {/* Email */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Masukkan email karyawan"
                aria-invalid={!!errors.email}
                disabled={isSubmitting || isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
          )}

          {/* Password */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Masukkan password (minimal 8 karakter)"
                aria-invalid={!!errors.password}
                disabled={isSubmitting || isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
          )}

          {/* Kode Karyawan - Read-only, shown when editing */}
          {isEditing && (
            <div className="space-y-2">
              <Label>Kode Karyawan</Label>
              <div className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                <p className="font-medium font-mono">
                  {initialData?.kode_karyawan || 'Belum tersedia'}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Kode Karyawan tidak dapat diubah.
              </p>
            </div>
          )}

          {/* Informasi Akun User - Only shown when editing */}
          {isEditing && initialData?.user_id && initialData?.user && (
            <div className="space-y-2">
              <Label>Informasi Akun User</Label>
              <div className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                <p className="font-medium">
                  {initialData.user?.name || "N/A"}
                </p>
                <p className="text-muted-foreground">
                  {initialData.user?.email || "N/A"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Informasi akun user tidak dapat diubah dari halaman ini.
              </p>
            </div>
          )}

          {/* Kategori Karyawan */}
          <div className="space-y-2">
            <Label htmlFor="kategori_karyawan">
              Kategori Karyawan <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.kategori_karyawan}
              onValueChange={(value: "tetap" | "kontrak" | "freelance") =>
                handleChange("kategori_karyawan", value)
              }
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger aria-invalid={!!errors.kategori_karyawan}>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tetap">Tetap</SelectItem>
                <SelectItem value="kontrak">Kontrak</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
            {errors.kategori_karyawan && (
              <p className="text-sm text-destructive">{errors.kategori_karyawan}</p>
            )}
          </div>

          {/* Subtipe Kontrak - hanya muncul jika kategori = kontrak */}
          {formData.kategori_karyawan === "kontrak" && (
            <div className="space-y-2">
              <Label htmlFor="subtipe_kontrak">
                Subtipe Kontrak <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.subtipe_kontrak || ""}
                onValueChange={(value: "full_time" | "part_time") =>
                  handleChange("subtipe_kontrak", value)
                }
                disabled={isSubmitting || isLoading}
              >
                <SelectTrigger aria-invalid={!!errors.subtipe_kontrak}>
                  <SelectValue placeholder="Pilih subtipe kontrak" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                </SelectContent>
              </Select>
              {errors.subtipe_kontrak && (
                <p className="text-sm text-destructive">{errors.subtipe_kontrak}</p>
              )}
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "aktif" | "nonaktif") =>
                handleChange("status", value)
              }
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Informasi Gaji */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Gaji</CardTitle>
          <CardDescription>
            Masukkan informasi gaji karyawan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tipe Gaji */}
          <div className="space-y-2">
            <Label htmlFor="tipe_gaji">
              Tipe Gaji <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.tipe_gaji}
              onValueChange={(value: "bulanan" | "per_sesi") =>
                handleChange("tipe_gaji", value)
              }
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger aria-invalid={!!errors.tipe_gaji}>
                <SelectValue placeholder="Pilih tipe gaji" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bulanan">Bulanan</SelectItem>
                <SelectItem value="per_sesi">Per Sesi</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipe_gaji && (
              <p className="text-sm text-destructive">{errors.tipe_gaji}</p>
            )}
          </div>

          {/* Input Gaji - Label berubah sesuai tipe gaji */}
          <div className="space-y-2">
            <Label htmlFor="gaji_pokok">
              {formData.tipe_gaji === "bulanan" ? "Gaji Pokok" : "Gaji Per Sesi"}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="gaji_pokok"
              type="number"
              step="0.01"
              min="0"
              value={formData.gaji_pokok || ""}
              onChange={(e) =>
                handleChange("gaji_pokok", parseFloat(e.target.value) || null)
              }
              placeholder={
                formData.tipe_gaji === "bulanan"
                  ? "Masukkan gaji pokok"
                  : "Masukkan gaji per sesi"
              }
              aria-invalid={!!errors.gaji_pokok}
              disabled={isSubmitting || isLoading}
            />
            {errors.gaji_pokok && (
              <p className="text-sm text-destructive">{errors.gaji_pokok}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informasi Bank */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Bank</CardTitle>
          <CardDescription>
            Masukkan informasi rekening bank karyawan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bank Nama */}
          <div className="space-y-2">
            <Label htmlFor="bank_nama">Nama Bank</Label>
            <Input
              id="bank_nama"
              value={formData.bank_nama || ""}
              onChange={(e) => handleChange("bank_nama", e.target.value)}
              placeholder="Contoh: Bank Central Asia"
              maxLength={60}
              disabled={isSubmitting || isLoading}
            />
          </div>

          {/* Bank No Rekening */}
          <div className="space-y-2">
            <Label htmlFor="bank_no_rekening">Nomor Rekening</Label>
            <Input
              id="bank_no_rekening"
              value={formData.bank_no_rekening || ""}
              onChange={(e) => handleChange("bank_no_rekening", e.target.value)}
              placeholder="Masukkan nomor rekening"
              maxLength={50}
              disabled={isSubmitting || isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informasi Kontak */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Kontak</CardTitle>
          <CardDescription>
            Masukkan informasi kontak karyawan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nomor HP */}
          <div className="space-y-2">
            <Label htmlFor="nomor_hp">Nomor Handphone</Label>
            <Input
              id="nomor_hp"
              value={formData.nomor_hp || ""}
              onChange={(e) => handleChange("nomor_hp", e.target.value)}
              placeholder="Contoh: 08234578900"
              maxLength={20}
              disabled={isSubmitting || isLoading}
            />
          </div>

          {/* Alamat */}
          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <textarea
              id="alamat"
              value={formData.alamat || ""}
              onChange={(e) => handleChange("alamat", e.target.value)}
              placeholder="Masukkan alamat lengkap"
              rows={4}
              disabled={isSubmitting || isLoading}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none",
                "placeholder:text-muted-foreground",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "disabled:cursor-not-allowed disabled:opacity-50",
                errors.alamat && "border-destructive ring-destructive/20"
              )}
            />
          </div>

          {/* Tanggal Lahir */}
          <div className="space-y-2">
            <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
            <Input
              id="tanggal_lahir"
              type="date"
              value={formData.tanggal_lahir || ""}
              onChange={(e) => handleChange("tanggal_lahir", e.target.value)}
              disabled={isSubmitting || isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Error */}
      {errors.submit && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      {/* Form Actions */}
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
        <Button type="submit" variant="success" disabled={isSubmitting || isLoading}>
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

