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
import { getSesiKerjaById, updateSesiKerja } from "@/lib/api/sesi-kerja";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import type { SesiKerjaFormData } from "@/lib/types/sesi-kerja";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditSesiKerjaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [initialData, setInitialData] = React.useState<SesiKerjaFormData | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getSesiKerjaById(id);
        setInitialData({
          kategori: data.kategori,
          mata_pelajaran: data.mata_pelajaran || '',
          hari: data.hari,
          jam_mulai: data.jam_mulai || '08:00:00',
          jam_selesai: data.jam_selesai || '09:00:00',
          tarif: data.tarif || 30000,
          status: data.status,
        });
      } catch (error: unknown) {
        const apiError = error as { message?: string };
        toast.error(apiError?.message || "Gagal memuat data sesi kerja");
        router.push("/dashboard/sesi-kerja");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, router]);

  const handleSubmit = async (data: SesiKerjaFormData) => {
    setIsSubmitting(true);
    try {
      await updateSesiKerja(id, data);
      toast.success("Sesi kerja berhasil diperbarui");
      router.push("/dashboard/sesi-kerja");
    } catch (error: unknown) {
      const apiError = error as { message?: string; errors?: Record<string, string | string[]> };
      if (apiError?.errors) {
        const errorMessages = Object.values(apiError.errors).flat();
        toast.error(errorMessages[0] || "Gagal memperbarui sesi kerja");
      } else {
        toast.error(apiError?.message || "Gagal memperbarui sesi kerja");
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/sesi-kerja");
  };

  if (loading) {
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
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!initialData) {
    return null;
  }

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
                <BreadcrumbPage>Edit</BreadcrumbPage>
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
            <h1 className="text-2xl font-bold tracking-tight">Edit Sesi Kerja</h1>
          </div>

          <SesiKerjaForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            submitLabel="Perbarui Sesi Kerja"
            isEditing={true}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

