"use client";

import * as React from "react";
import { PermissionSelector } from "./permission-selector";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RoleFormData } from "@/lib/types/role";
import { cn } from "@/lib/utils";

interface RoleFormProps {
  initialData?: Partial<RoleFormData>;
  onSubmit: (data: RoleFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  className?: string;
}

export function RoleForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Create Role",
  className,
}: RoleFormProps) {
  const [formData, setFormData] = React.useState<RoleFormData>({
    name: initialData?.name || "",
    guard_name: initialData?.guard_name || "web",
    permissions: initialData?.permissions || [],
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Client-side validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Nama role wajib diisi.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: any) {
      // Handle API validation errors
      if (error?.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ submit: error?.message || "Failed to save role" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof RoleFormData, value: any) => {
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

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
          <CardDescription>
            Enter the basic information for this role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              Role Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Manager, Admin, Editor"
              aria-invalid={!!errors.name}
              disabled={isSubmitting || isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Guard Name Field */}
          <div className="space-y-2">
            <label
              htmlFor="guard_name"
              className="text-sm font-medium leading-none"
            >
              Guard Name
            </label>
            <Select
              value={formData.guard_name}
              onValueChange={(value) =>
                handleChange("guard_name", value as "web" | "api")
              }
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger id="guard_name">
                <SelectValue placeholder="Select guard" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the guard name for this role (default: web)
            </p>
            {errors.guard_name && (
              <p className="text-sm text-destructive">{errors.guard_name}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            Select the permissions to assign to this role
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <PermissionSelector
              selectedPermissions={formData.permissions || []}
              onSelectionChange={(permissions) =>
                handleChange("permissions", permissions)
              }
            />
          )}
          {errors.permissions && (
            <p className="mt-4 text-sm text-destructive">{errors.permissions}</p>
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
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

