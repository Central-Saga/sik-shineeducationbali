"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api/auth";
import { toast } from "sonner";
import type { LoginCredentials } from "@/lib/api/auth";
import { GraduationCap } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { refetch } = useAuth();
  const [credentials, setCredentials] = React.useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Client-side validation
    const newErrors: Record<string, string> = {};
    if (!credentials.email.trim()) {
      newErrors.email = "Email wajib diisi.";
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = "Email harus berupa format email yang valid.";
    }

    if (!credentials.password.trim()) {
      newErrors.password = "Password wajib diisi.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await login(credentials);
      
      // Fetch user data first before redirecting
      await refetch();
      
      toast.success("Login berhasil! Selamat datang kembali.");
      
      // Use window.location for hard redirect to ensure all state is refreshed
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      // Handle API validation errors
      if (error && typeof error === 'object' && 'errors' in error) {
        const errorData = error as { errors?: Record<string, string> | Record<string, string[]> };
        const errorErrors = errorData.errors;
        // Handle both string and array error formats
        if (errorErrors) {
          const normalizedErrors: Record<string, string> = {};
          Object.keys(errorErrors).forEach((key) => {
            const value = errorErrors[key];
            normalizedErrors[key] = Array.isArray(value) ? value[0] : value;
          });
          setErrors(normalizedErrors);
        } else {
          setErrors({});
        }
        toast.error("Validasi gagal. Silakan periksa input Anda.");
      } else if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message?: string }).message || "Login gagal. Silakan coba lagi.";
        toast.error(errorMessage);
        if (errorMessage.includes("credentials")) {
          setErrors({ email: "Email atau password salah." });
        } else {
          setErrors({});
        }
      } else {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
        setErrors({});
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors((prev) => {
        const newErrors = { ...(prev || {}) };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl font-bold">Selamat Datang Kembali</h1>
                </div>
                <p className="text-muted-foreground text-balance">
                  Masuk ke akun SIK - Shine Education Bali Anda
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  value={credentials.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  aria-invalid={!!errors?.email}
                  disabled={isLoading}
                  required
                />
                {errors?.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline text-muted-foreground"
                  >
                    Lupa kata sandi?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan kata sandi Anda"
                  value={credentials.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  aria-invalid={!!errors?.password}
                  disabled={isLoading}
                  required
                />
                {errors?.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
              </Field>
              <Field>
                <Button type="submit" variant="gradient" disabled={isLoading} className="w-full">
                  {isLoading ? "Masuk..." : "Masuk"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"
              alt="Sistem Informasi Kepegawaian Shine Education Bali"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70 flex items-center justify-center">
              <div className="text-center p-8 text-white">
                <GraduationCap className="h-24 w-24 mx-auto mb-4 text-white/90" />
                <h2 className="text-3xl font-bold mb-2">SIK</h2>
                <p className="text-lg font-semibold mb-1">Sistem Informasi Kepegawaian</p>
                <p className="text-white/90">
                  Shine Education Bali
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        Dengan mengklik masuk, Anda menyetujui{" "}
        <a href="#" className="underline underline-offset-2 hover:text-primary">
          Syarat Layanan
        </a>{" "}
        dan{" "}
        <a href="#" className="underline underline-offset-2 hover:text-primary">
          Kebijakan Privasi
        </a>
        .
      </FieldDescription>
    </div>
  );
}
