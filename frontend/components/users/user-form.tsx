"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserFormData } from "@/lib/types/user";
import { useRoles } from "@/hooks/use-roles";
import { cn } from "@/lib/utils";

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  className?: string;
}

export function UserForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Tambah Pengguna",
  className,
}: UserFormProps) {
  const { roles, loading: rolesLoading } = useRoles();
  const [formData, setFormData] = React.useState<UserFormData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: initialData?.password || "",
    password_confirmation: initialData?.password_confirmation || "",
    roles: initialData?.roles || [],
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = !!initialData?.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Client-side validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid.";
    }
    if (!isEditing && !formData.password) {
      newErrors.password = "Password wajib diisi.";
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter.";
    }
    if (formData.password && formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Konfirmasi password tidak sesuai.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Remove password_confirmation before submitting
      const { password_confirmation, ...submitData } = formData;
      // Only include password if it's set (for editing)
      if (isEditing && !submitData.password) {
        delete submitData.password;
      }
      // Always include roles (even if empty array) so backend can sync them
      submitData.roles = submitData.roles || [];
      await onSubmit(submitData as UserFormData);
    } catch (error: any) {
      // Handle API validation errors
      if (error?.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ submit: error?.message || "Gagal menyimpan pengguna" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof UserFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleRoleToggle = (roleName: string) => {
    const currentRoles = formData.roles || [];
    const isSelected = currentRoles.includes(roleName);
    
    if (isSelected) {
      handleChange("roles", currentRoles.filter((r) => r !== roleName));
    } else {
      handleChange("roles", [...currentRoles, roleName]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pengguna</CardTitle>
          <CardDescription>
            Masukkan informasi dasar untuk pengguna ini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              Nama <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Masukkan nama lengkap"
              aria-invalid={!!errors.name}
              disabled={isSubmitting || isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="contoh@email.com"
              aria-invalid={!!errors.email}
              disabled={isSubmitting || isLoading || isEditing}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none">
              Password {!isEditing && <span className="text-destructive">*</span>}
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password || ""}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder={isEditing ? "Kosongkan jika tidak ingin mengubah" : "Minimal 8 karakter"}
              aria-invalid={!!errors.password}
              disabled={isSubmitting || isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Kosongkan jika tidak ingin mengubah password
              </p>
            )}
          </div>

          {/* Password Confirmation Field */}
          {formData.password && (
            <div className="space-y-2">
              <label htmlFor="password_confirmation" className="text-sm font-medium leading-none">
                Konfirmasi Password {!isEditing && <span className="text-destructive">*</span>}
              </label>
              <Input
                id="password_confirmation"
                type="password"
                value={formData.password_confirmation || ""}
                onChange={(e) => handleChange("password_confirmation", e.target.value)}
                placeholder="Ulangi password"
                aria-invalid={!!errors.password_confirmation}
                disabled={isSubmitting || isLoading}
              />
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">{errors.password_confirmation}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Peran</CardTitle>
          <CardDescription>
            Pilih peran yang akan ditetapkan untuk pengguna ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rolesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada peran tersedia</p>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => {
                const isSelected = formData.roles?.includes(role.name) || false;
                return (
                  <div
                    key={role.id}
                    className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={isSelected}
                      onCheckedChange={() => handleRoleToggle(role.name)}
                      disabled={isSubmitting || isLoading}
                    />
                    <label
                      htmlFor={`role-${role.id}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {role.name}
                    </label>
                  </div>
                );
              })}
            </div>
          )}
          {errors.roles && (
            <p className="mt-4 text-sm text-destructive">{errors.roles}</p>
          )}
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
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

