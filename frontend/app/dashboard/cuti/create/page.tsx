"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { CutiForm } from "@/components/cuti/cuti-form";
import { Button } from "@/components/ui/button";
import { createCuti } from "@/lib/api/cuti";
import type { CutiFormData } from "@/lib/types/cuti";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function CreateCutiPage() {
  const router = useRouter();
  const { hasRole, loading } = useAuth();

  // Validasi role - redirect jika tidak memiliki akses
  React.useEffect(() => {
    if (!loading && !hasRole('Karyawan') && !hasRole('Admin') && !hasRole('Owner')) {
      toast.error("Anda tidak memiliki akses untuk mengajukan cuti");
      router.push("/dashboard/cuti");
    }
  }, [hasRole, loading, router]);

  // Tampilkan loading jika masih loading
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
            <p>Memuat...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!hasRole('Karyawan') && !hasRole('Admin') && !hasRole('Owner')) {
    return null; // Akan di-redirect oleh useEffect
  }

  const handleSubmit = async (data: CutiFormData) => {
    try {
      await createCuti(data);
      toast.success("Pengajuan cuti berhasil dibuat");
      router.push("/dashboard/cuti");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal mengajukan cuti";
      toast.error(errorMessage);
      throw error;
    }
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
                <BreadcrumbLink href="/dashboard/cuti">Cuti</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Ajukan</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/cuti">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Kembali</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <CalendarDays className="h-6 w-6" />
                Ajukan Cuti
              </h1>
              <p className="text-muted-foreground">
                Ajukan cuti, izin, atau sakit
              </p>
            </div>
          </div>

          <CutiForm
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/cuti")}
            submitLabel="Ajukan Cuti"
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

