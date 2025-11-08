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
import { EmployeeForm } from "@/components/employees/employee-form";
import { useEmployee } from "@/hooks/use-employee";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { EmployeeFormData } from "@/lib/types/employee";

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  const { employee, loading, error, update } = useEmployee(employeeId);

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      await update(data);
      toast.success("Karyawan berhasil diperbarui");
      router.push("/dashboard/employees");
    } catch (error: any) {
      // Error will be handled by EmployeeForm component
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
            <p className="text-sm text-muted-foreground">Memuat data karyawan...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !employee) {
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
              <h2 className="text-xl font-semibold mb-2">Karyawan tidak ditemukan</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {error || "Karyawan yang Anda cari tidak ada."}
              </p>
              <Button asChild>
                <Link href="/dashboard/employees">Kembali ke Daftar Karyawan</Link>
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
                <BreadcrumbLink href="/dashboard/employees">Karyawan</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Detail</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/employees">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Kembali</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Detail Karyawan: {employee?.user?.name || `ID: ${employee?.id || 'N/A'}`}
              </h1>
              <p className="text-muted-foreground">
                Perbarui informasi karyawan
              </p>
            </div>
          </div>

          <EmployeeForm
            initialData={{
              id: employee?.id || 0,
              kode_karyawan: employee?.kode_karyawan || "",
              user_id: employee?.user_id || null,
              user: employee?.user
                ? {
                    id: employee.user?.id || 0,
                    name: employee.user?.name || "",
                    email: employee.user?.email || "",
                  }
                : undefined,
              kategori_karyawan: employee?.kategori_karyawan || "",
              subtipe_kontrak: employee?.subtipe_kontrak || null,
              tipe_gaji: employee?.tipe_gaji || "",
              gaji_pokok: employee?.gaji_pokok || null,
              bank_nama: employee?.bank_nama || "",
              bank_no_rekening: employee?.bank_no_rekening || "",
              nomor_hp: employee?.nomor_hp || "",
              alamat: employee?.alamat || "",
              tanggal_lahir: employee?.tanggal_lahir || "",
              status: employee?.status || "aktif",
            }}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/employees")}
            submitLabel="Perbarui Karyawan"
            isLoading={loading}
            isEditing={true}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

