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
import { SesiKerjaForm } from "@/components/sesi-kerja/sesi-kerja-form";
import { createSesiKerja } from "@/lib/api/sesi-kerja";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { SesiKerjaFormData } from "@/lib/types/sesi-kerja";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateSesiKerjaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: SesiKerjaFormData) => {
    setIsSubmitting(true);
    try {
      await createSesiKerja(data);
      toast.success("Sesi kerja berhasil dibuat");
      router.push("/dashboard/sesi-kerja");
    } catch (error: unknown) {
      const apiError = error as { message?: string; errors?: Record<string, string | string[]> };
      if (apiError?.errors) {
        const errorMessages = Object.values(apiError.errors).flat();
        toast.error(errorMessages[0] || "Gagal membuat sesi kerja");
      } else {
        toast.error(apiError?.message || "Gagal membuat sesi kerja");
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/sesi-kerja");
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
                <BreadcrumbLink href="/dashboard/sesi-kerja">Sesi Kerja</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Tambah</BreadcrumbPage>
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
            <h1 className="text-2xl font-bold tracking-tight">Tambah Sesi Kerja</h1>
          </div>

          <SesiKerjaForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            submitLabel="Simpan Sesi Kerja"
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

