"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { RealisasiSesiForm } from "@/components/realisasi-sesi/realisasi-sesi-form";
import { createRealisasiSesi } from "@/lib/api/realisasi-sesi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { RealisasiSesiFormData } from "@/lib/types/realisasi-sesi";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function CreateRealisasiSesiPage() {
  const router = useRouter();
  const { hasRole, hasPermission, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isAdmin = hasRole('Admin') || hasRole('Owner');
  
  // Check if user has permission to create realisasi sesi
  const canCreate = hasPermission('mengajukan realisasi sesi') || hasPermission('mengelola realisasi sesi');
  
  // Redirect if user doesn't have permission
  React.useEffect(() => {
    if (!loading && !canCreate) {
      router.replace("/dashboard/realisasi-sesi");
    }
  }, [loading, canCreate, router]);
  
  // Show loading state while checking auth
  if (loading || !canCreate) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Memuat...</div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: RealisasiSesiFormData) => {
    setIsSubmitting(true);
    try {
      await createRealisasiSesi(data);
      toast.success(isAdmin ? "Realisasi sesi berhasil ditambahkan" : "Realisasi sesi berhasil diajukan");
      router.push("/dashboard/realisasi-sesi");
    } catch (error: unknown) {
      const apiError = error as { message?: string; errors?: Record<string, string | string[]> };
      if (apiError?.errors) {
        const errorMessages = Object.values(apiError.errors).flat();
        toast.error(errorMessages[0] || "Gagal mengajukan realisasi sesi");
      } else {
        toast.error(apiError?.message || "Gagal mengajukan realisasi sesi");
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/realisasi-sesi");
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/realisasi-sesi">Realisasi Sesi</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{isAdmin ? 'Tambah' : 'Ajukan'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              {isAdmin ? 'Tambah Realisasi Sesi' : 'Ajukan Realisasi Sesi'}
            </h1>
          </div>

          <RealisasiSesiForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            submitLabel={isAdmin ? 'Simpan Realisasi Sesi' : 'Ajukan Realisasi Sesi'}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

