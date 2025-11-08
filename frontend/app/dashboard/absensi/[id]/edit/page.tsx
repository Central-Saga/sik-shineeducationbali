"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { AbsensiForm } from "@/components/absensi/absensi-form";
import { getAbsensiById, updateAbsensi } from "@/lib/api/absensi";
import type { AbsensiFormData } from "@/lib/types/absensi";
import type { Absensi } from "@/lib/types/absensi";
import { toast } from "sonner";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";

export default function EditAbsensiPage() {
  const router = useRouter();
  const params = useParams();
  const absensiId = params.id as string;
  const [absensi, setAbsensi] = React.useState<Absensi | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadAbsensi = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAbsensiById(absensiId);
        setAbsensi(data);
      } catch (err: any) {
        setError(err?.message || "Gagal memuat data absensi");
      } finally {
        setLoading(false);
      }
    };
    loadAbsensi();
  }, [absensiId]);

  const handleSubmit = async (data: AbsensiFormData) => {
    try {
      await updateAbsensi(absensiId, data);
      toast.success("Absensi berhasil diperbarui");
      router.push("/dashboard/absensi");
    } catch (error: any) {
      toast.error(error?.message || "Gagal memperbarui absensi");
      throw error;
    }
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
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:p-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Memuat data absensi...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !absensi) {
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
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Absensi tidak ditemukan</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {error || "Absensi yang Anda cari tidak ada."}
              </p>
              <Button asChild>
                <Link href="/dashboard/absensi">Kembali ke Daftar Absensi</Link>
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
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
                <BreadcrumbLink href="/dashboard/absensi">Absensi</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
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
                Edit Absensi: {absensi.employee?.user?.name || `ID: ${absensi.id}`}
              </h1>
              <p className="text-muted-foreground">
                Perbarui informasi absensi
              </p>
            </div>
          </div>

          <AbsensiForm
            initialData={{
              id: absensi.id,
              karyawan_id: absensi.karyawan_id,
              tanggal: absensi.tanggal,
              status_kehadiran: absensi.status_kehadiran,
              jam_masuk: absensi.jam_masuk || null,
              jam_pulang: absensi.jam_pulang || null,
              sumber_absen: absensi.sumber_absen || null,
              catatan: absensi.catatan || null,
            }}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/absensi")}
            submitLabel="Perbarui Absensi"
            isLoading={loading}
            isEditing={true}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

