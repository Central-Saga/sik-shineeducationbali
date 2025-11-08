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
import { AbsensiForm } from "@/components/absensi/absensi-form";
import { Button } from "@/components/ui/button";
import { createAbsensi } from "@/lib/api/absensi";
import type { AbsensiFormData } from "@/lib/types/absensi";
import { toast } from "sonner";
import { ArrowLeft, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function CreateAbsensiPage() {
  const router = useRouter();
  const { hasRole, loading } = useAuth();

  // Validasi role karyawan - redirect jika bukan karyawan
  React.useEffect(() => {
    if (!loading && !hasRole('Karyawan')) {
      toast.error("Hanya karyawan yang dapat melakukan absensi");
      router.push("/dashboard/absensi");
    }
  }, [hasRole, loading, router]);

  // Tampilkan loading atau tidak ada akses jika bukan karyawan
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

  if (!hasRole('Karyawan')) {
    return null; // Akan di-redirect oleh useEffect
  }

  const handleSubmit = async (data: AbsensiFormData) => {
    try {
      await createAbsensi(data);
      toast.success("Absensi berhasil ditambahkan");
      router.push("/dashboard/absensi");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menambahkan absensi";
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
                <BreadcrumbLink href="/dashboard/absensi">Absensi</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Tambah</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/absensi">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Kembali</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Tambah Absensi Baru
              </h1>
              <p className="text-muted-foreground">
                Tambahkan data absensi karyawan
              </p>
            </div>
          </div>

          <AbsensiForm
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/absensi")}
            submitLabel="Simpan Absensi"
            enableCheckInOut={true}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

