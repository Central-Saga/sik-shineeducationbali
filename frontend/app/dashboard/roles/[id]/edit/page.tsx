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
import { RoleForm } from "@/components/roles/role-form";
import { useRole } from "@/hooks/use-role";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;
  const { role, loading, error, update } = useRole(roleId);

  const handleSubmit = async (data: any) => {
    try {
      await update(data);
      toast.success("Peran berhasil diperbarui");
      router.push("/dashboard/roles");
    } catch (error: any) {
      // Error will be handled by RoleForm component
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
            <p className="text-sm text-muted-foreground">Memuat peran...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !role) {
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
              <h2 className="text-xl font-semibold mb-2">Peran tidak ditemukan</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {error || "Peran yang Anda cari tidak ada."}
              </p>
              <Button asChild>
                <Link href="/dashboard/roles">Kembali ke Peran</Link>
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
                <BreadcrumbLink href="/dashboard/roles">Peran</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Ubah</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/roles">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Kembali</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Ubah Peran: {role.name}
              </h1>
              <p className="text-muted-foreground">
                Perbarui informasi peran dan izin
              </p>
            </div>
          </div>

          <RoleForm
            initialData={{
              name: role.name,
              guard_name: role.guard_name as "web" | "api",
              permissions: role.permissions,
            }}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/roles")}
            submitLabel="Perbarui Peran"
            isLoading={loading}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

